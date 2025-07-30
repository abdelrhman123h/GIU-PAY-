import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add-money')
  async addMoney(@Request() req, @Body('amount') amount: number) {
    return this.walletService.addMoney(req.user.userId, amount);
  }

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  async withdraw(@Request() req, @Body('amount') amount: number) {
    return this.walletService.withdraw(req.user.userId, amount);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMoney(
    @Request() req,
    @Body() body: {
      receiver: string;
      amount: number;
      category?: string;
      staffDept?: string;
      foodCourt?: string;
    }
  ) {
    const { receiver, amount, category, staffDept, foodCourt } = body;
    
    return this.walletService.sendMoney(
      req.user.userId,
      receiver,
      amount,
      category,
      staffDept,
      foodCourt,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getHistory(@Request() req) {
    return this.walletService.getTransactionHistory(req.user.userId);
  }
}