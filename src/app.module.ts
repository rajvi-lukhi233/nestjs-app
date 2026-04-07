import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { EmailService } from './utils/email/email.service';
import { EmailModule } from './utils/email/email.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ProductModule,
    MongooseModule.forRoot(process.env.DB_URL as string),
    RedisModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
