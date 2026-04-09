import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { registerDto } from './dto/register.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { loginDto } from './dto/login.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import crypto from 'crypto';
import { verifyOtpDto } from './dto/verifyOtp.dto';
import { forgotPassDto } from './dto/forgotPass.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}
  async registerUser(dto: registerDto) {
    const hasPass = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.createUser({
      ...dto,
      password: hasPass,
    });
    const token = await this.jwtService.signAsync({ userId: user._id });
    return { message: 'User registered', data: { ...user.toObject(), token } };
  }

  async loginUser(dto: loginDto) {
    const user = await this.userService.findUser({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    const comparePass = await bcrypt.compare(dto.password, user.password);
    if (!comparePass) {
      throw new UnauthorizedException('Invalid password');
    }
    const token = await this.jwtService.signAsync({ userId: user._id });
    return {
      message: 'Login successfully',
      data: { ...user.toObject(), token },
    };
  }

  async sendOtp(email: string) {
    const user = await this.userService.findUser({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const otp = Math.floor(100000 + Math.random() * 90000).toString();

    await this.redisService.set(`otp:${user._id}`, otp, 300);

    await this.emailService.sendEmail({
      to: email,
      subject: 'Reset Password OTP',
      otp,
    });

    return { message: 'OTP sent successfully', data: null };
  }

  async verifyOtp(dto: verifyOtpDto) {
    const user = await this.userService.findUser({
      email: dto.email,
    });
    const resetPassToken = crypto.randomBytes(32).toString('hex');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const storedOTP = await this.redisService.get(`otp:${user._id}`);
    if (!storedOTP) {
      throw new ConflictException(
        'OTP has expired or not found. Please request for new OTP',
      );
    }

    if (dto.otp != storedOTP) {
      throw new ConflictException('Invalid OTP');
    }
    await this.redisService.delete(`otp:${user._id}`);

    await this.userService.updateUserById(user._id.toString(), {
      resetPassToken,
      resetPassTokenExpired: new Date(Date.now() + 10 * 60 * 1000),
    });
    return { message: 'OTP verify successfully', data: resetPassToken };
  }
  async forgotPassword(forgotPasswordDto: forgotPassDto) {
    const user = await this.userService.findUser({
      resetPassToken: forgotPasswordDto.token,
    });
    if (!user) {
      throw new BadRequestException('Invalid reset password token');
    }
    if (user.resetPassTokenExpired < new Date()) {
      throw new BadRequestException('Reset password token is expired');
    }
    const hashPass = await bcrypt.hash(forgotPasswordDto.newPassword, 10);

    await this.userService.updateUserById(user._id.toString(), {
      password: hashPass,
      resetPassToken: null,
      resetPassTokenExpired: null,
    });
    return { message: 'Password reset successfully' };
  }
}
