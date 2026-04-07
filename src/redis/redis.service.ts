import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client;
  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
    await this.client.connect();
    console.log('Redis connected');
  }
  async set(key: string, value: any, expireIn?: number | null) {
    try {
      const data = typeof value == 'string' ? value : JSON.stringify(value);
      await this.client.set(key, data, { EX: expireIn });
    } catch (error) {
      console.log('Redis set error:', error);
    }
  }
  async get(key: string) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log('Redis get error:', error);
    }
  }
  async delete(key: string) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.log('Redis delete error:', error);
    }
  }
}
