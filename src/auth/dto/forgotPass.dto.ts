import { IsString } from 'class-validator';
export class forgotPassDto {
  @IsString()
  token: string;

  @IsString()
  newPassword: string;
}
