import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './DTO/register.Dto';
import { LoginDto } from './DTO/login.Dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

@Post('register')
register(@Body() dto: RegisterDto) {
  let roleValue: string | undefined;

  if (dto.role === 'staff') {
    roleValue = dto.staff;
  } else if (dto.role === 'food-court') {
    roleValue = dto.foodCourt;
  }

  return this.authService.register(dto.email, dto.password, dto.role, roleValue);
}


  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
