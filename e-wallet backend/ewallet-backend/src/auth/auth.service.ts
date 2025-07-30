import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

async register(email: string, password: string, role: string, roleValue?: string) {
  const existing = await this.userModel.findOne({ email });
  if (existing) throw new Error('Email already registered');

  const hashed = await bcrypt.hash(password, 10);

  const userData: any = { email, password: hashed };

  if (role === 'student') {
    userData.student = 'true'; // or some value
  } else if (role === 'staff') {
    if (!roleValue) throw new Error('Department is required for staff');
    userData.staff = roleValue;  // Save department
  } else if (role === 'food-court') {
    if (!roleValue) throw new Error('Food court is required for food-court');
    userData.foodCourt = roleValue; // Save food court name
  }

  const user = new this.userModel(userData);
  await user.save();
  return { message: 'User registered successfully' };
}



  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user._id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { token };
  }
}
