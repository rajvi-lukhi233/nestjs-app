import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerDto } from './dto/register.dto';
import { loginDto } from './dto/login.dto';
import { verifyOtpDto } from './dto/verifyOtp.dto';
import { forgotPassDto } from './dto/forgotPass.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() dto: registerDto) {
    return await this.authService.registerUser(dto);
  }

  @Post('login')
  async login(@Body() dto: loginDto) {
    return await this.authService.loginUser(dto);
  }

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: verifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('forgot-password')
  async forgotUserPassword(@Body() dto: forgotPassDto) {
    return this.authService.forgotPassword(dto);
  }
}
