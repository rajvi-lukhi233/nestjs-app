import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('email')
export class MailProcessor extends WorkerHost {
  async process(job: Job<any>) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: job.data.to,
      subject: job.data.subject,
      html: `<h2>Your reset passsword OTP is: ${job.data.otp}</h2>`,
    });

    // send email here
    console.log(`Sending email to ${job.data.to}`);
  }
}
