import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailServiceMock {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation({ email, login, token }: { email: string; login: string; token: string }): Promise<void> {
    return;
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
    return;
  }
}
