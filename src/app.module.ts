import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { BullModule } from '@nestjs/bullmq';
import { ChatModule } from './chat/chat.module';
import { GroupModule } from './group/group.module';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { ReadPdfController } from './streaming/streamingFile.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 5,
      },
    ]),
    AuthModule,
    UserModule,
    ProductModule,
    OrderModule,
    MongooseModule.forRoot(process.env.DB_URL as string),
    RedisModule,
    EmailModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    ChatModule,
    GroupModule,
    ChatRoomModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
  controllers: [ReadPdfController],
})
export class AppModule {}
