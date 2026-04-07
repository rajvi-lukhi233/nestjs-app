import { IsEmail, IsString } from 'class-validator';
export class verifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}
