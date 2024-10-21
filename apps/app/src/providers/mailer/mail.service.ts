import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation({ email, login, token }: { email: string; login: string; token: string }): Promise<void> {
    //TODO добавить конфиг сервис
    const url = `https://navaibe.ru/email-confirmed?code=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome! Confirm your Email',
      template: './confirmation',
      context: {
        name: login,
        url,
      },
    });
  }

  async sendUerOauthRegistration({
    email,
    login,
    service,
  }: {
    email: string;
    login: string;
    service: string;
  }): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Здравствуйте! Вы авторизовались с помощью OAuth',
      template: './oauth-registration',
      context: {
        name: login,
        service: service,
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
    const url = `https://navaibe.ru/create-new-password?recoveryCode=${recoveryCode}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome! Confirm your Email',
      template: './password-recovery',
      context: {
        name: login,
        url,
      },
    });
  }
}
