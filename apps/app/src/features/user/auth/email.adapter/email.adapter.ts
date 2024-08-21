import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAdapter {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aliakseiyarmolinforit@gmail.com', // process.env.EMAIL
        pass: 'nptlfitpkroheddl', // process.env.EMAIL_PASS
      },
    });
  }

  async sendConfirmationCodeEmail({ email, confirmationCode }: { email: string; confirmationCode: string }) {
    await this.transporter.sendMail({
      from: '"Confirm email" <aliakseiyarmolinforit@gmail.com>',
      to: email,
      subject: 'Confirmation Code',
      html: `<h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
            </p>`,
    });
  }

  async sendRecoveryCodeEmail({ email, recoveryCode }: { email: string; recoveryCode: string }) {
    await this.transporter.sendMail({
      from: '"Rocovery code" <aliakseiyarmolinforit@gmail.com>',
      to: email,
      subject: 'Password Recovery',
      html: `<h1>Password recovery</h1>
            <p>To finish password recovery please follow the link below:
                <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
            </p>`,
    });
  }
}
