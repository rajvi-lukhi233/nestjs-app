import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  async sendEmail(to: string, subject: string, otp: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: `<h2>Your reset passsword OTP is: ${otp}</h2>`,
    });
  }
}
