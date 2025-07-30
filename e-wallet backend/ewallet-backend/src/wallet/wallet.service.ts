import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from './wallet.schema';
import { Transaction } from './transaction.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/user.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  private validateAmount(amount: number) {
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }
  }

  private async getEmailByUserId(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId).lean();
    return user?.email || 'unknown';
  }

  async addMoney(userId: string, amount: number) {
    this.validateAmount(amount);

    let wallet = await this.walletModel.findOne({ userId });
    if (!wallet) {
      wallet = new this.walletModel({ userId, balance: 0 });
    }
    wallet.balance += amount;
    await wallet.save();

    await this.transactionModel.create({ userId, type: 'add', amount });

    return { message: 'Money added successfully', balance: wallet.balance };
  }

  async getBalance(userId: string) {
    const wallet = await this.walletModel.findOne({ userId });
    return { balance: wallet?.balance || 0 };
  }

  async withdraw(userId: string, amount: number) {
    this.validateAmount(amount);

    const wallet = await this.walletModel.findOne({ userId });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.balance < amount)
      throw new BadRequestException('Insufficient balance');

    wallet.balance -= amount;
    await wallet.save();

    await this.transactionModel.create({ userId, type: 'withdraw', amount });

    return { message: 'Withdrawal successful', balance: wallet.balance };
  }

  async sendMoney(
    senderId: string,
    receiver: string,      // can be email or userId
    amount: number,
    category?: string,
    staffDept?: string,
    foodCourt?: string,
  ) {
    try {
      this.validateAmount(amount);

      let receiverUser;

      // Always try to find by email first, then by userId (MongoDB _id)
      receiverUser = await this.userModel.findOne({ email: receiver }).lean();

      if (!receiverUser) {
        // If not found by email, try by userId (validate ObjectId format first)
        if (/^[a-f\d]{24}$/i.test(receiver)) {
          receiverUser = await this.userModel.findById(receiver).lean();
        }
      }

      if (!receiverUser) {
        throw new NotFoundException('Receiver not found');
      }

      // Additional validation for staff category
      if (category === 'staff') {
        if (staffDept && receiverUser.staff !== staffDept) {
          throw new BadRequestException('Receiver does not belong to the selected department');
        }
      }

      // Updated validation for food-court category
      // For food court transactions, we expect the receiver to be the food court vendor
      // The frontend sends the food court email as receiver, so we validate that this user
      // is indeed a food court vendor by checking if they have the expected email pattern
      if (category === 'food-court') {
        // Check if the receiver email matches expected food court email patterns
        const validFoodCourtEmails = [
          'essen@giu.com',
          'container@giu.com', 
          'Demeshk@giu.com',
          'cafeteria@giu.com',
          'Bean&Bunn@giu.com',
          'Xsquare@giu.com',
          'Mullery@giu.com',
          'Loaded@giu.com',
          'Boosters@giu.com'
        ];
        
        if (!validFoodCourtEmails.includes(receiverUser.email)) {
          throw new BadRequestException('Invalid food court vendor');
        }
      }

      // Convert both IDs to strings for comparison to avoid type issues
      if (receiverUser._id.toString() === senderId.toString()) {
        throw new BadRequestException('Cannot send money to yourself');
      }

      // Find sender wallet
      const senderWallet = await this.walletModel.findOne({ userId: senderId });
      if (!senderWallet) {
        throw new NotFoundException('Sender wallet not found');
      }
      
      if (senderWallet.balance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Find or create receiver wallet
      let receiverWallet = await this.walletModel.findOne({ 
        userId: receiverUser._id.toString() 
      });
      
      if (!receiverWallet) {
        receiverWallet = new this.walletModel({ 
          userId: receiverUser._id.toString(), 
          balance: 0 
        });
      }

      // Update balances
      senderWallet.balance -= amount;
      receiverWallet.balance += amount;

      // Save both wallets
      await senderWallet.save();
      await receiverWallet.save();

      // Get sender email for transaction record
      const senderEmail = await this.getEmailByUserId(senderId);

      // Record transactions including category info for tracking
      await this.transactionModel.create({
        userId: senderId,
        type: 'send',
        amount,
        toEmail: receiverUser.email,
        category,
        staffDept: category === 'staff' ? staffDept : undefined,
        foodCourt: category === 'food-court' ? foodCourt : undefined,
      });

      await this.transactionModel.create({
        userId: receiverUser._id.toString(),
        type: 'receive',
        amount,
        fromEmail: senderEmail,
        category,
        staffDept: category === 'staff' ? staffDept : undefined,
        foodCourt: category === 'food-court' ? foodCourt : undefined,
      });

      // Determine the display name for the success message
      let displayName = receiverUser.email;
      if (category === 'food-court' && foodCourt) {
        displayName = foodCourt; // Use the food court name instead of email
      }

      return {
        message: `Sent ${amount} to ${displayName}`,
        senderBalance: senderWallet.balance,
        receiverEmail: receiverUser.email,
      };

    } catch (error) {
      // Log the error for debugging
      console.error('SendMoney error:', error);
      throw error;
    }
  }

  async getTransactionHistory(userId: string) {
    return this.transactionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }
}