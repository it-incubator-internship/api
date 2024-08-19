import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAdapterMock {
  async sendConfirmationCodeEmail({ email, code }: { email: string; code: string }) {
    // Заглушка для метода sendConfirmationCodeEmail
  }

  async sendRecoveryCodeEmail({ email, code }: { email: string; code: string }) {
    // Заглушка для метода sendRecoveryCodeEmail
  }
}
