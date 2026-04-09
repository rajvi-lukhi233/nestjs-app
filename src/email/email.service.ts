import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}
  async sendEmail(data: { to: string; subject: string; otp: string }) {
    await this.emailQueue.add('send-email', data);
  }
}
