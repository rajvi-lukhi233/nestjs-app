import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';
import { EmailModule } from 'src/utils/email/email.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    UserModule,
    RedisModule,
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, AuthGuard],
})
export class AuthModule {}
