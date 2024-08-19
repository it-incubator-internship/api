import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation({ email, login, token }: { email: string; login: string; token: string }): Promise<void> {
    const url = `https://somesite.com/confirm-email?code=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome! Confirm your Email',
      template: './confirmation',
      context: {
        name: login,
        url,
        token,
      },
    });
  }
}
