import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation({ email, login, token }: { email: string; login: string; token: string }): Promise<void> {
    //TODO добавить конфиг сервис
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

  async sendPasswordRecovery({
    email,
    login,
    recoveryCode,
  }: {
    email: string;
    login: string;
    recoveryCode: string;
  }): Promise<void> {
    //TODO добавить конфиг сервис
    const url = `https://somesite.com/password-recovery?recoveryCode=${recoveryCode}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome! Confirm your Email',
      template: './password-recovery',
      context: {
        name: login,
        url,
        token: recoveryCode,
      },
    });
  }
}
