import { AccountData } from '../../../../../prisma/client';

export enum UserConfirmationStatusEnum {
  CONFIRM = 'CONFIRM',
  NOT_CONFIRM = 'NOT_CONFIRM',
}

export class UserAccountData implements AccountData {
  profileId: string;
  confirmationStatus: UserConfirmationStatusEnum;
  confirmationCode: string;
  recoveryCode: string | null;
  githubId: string | null;
  googleId: string | null;

  static create({ confirmationCode }: { confirmationCode: string }): Omit<AccountData, 'profileId'> {
    const userAccountData = {
      confirmationCode,
    };
    return Object.assign(new this(), userAccountData);
  }

  // метод для преобразования в "умную" модель
  static convert(accountData: AccountData) {
    return Object.assign(new this(), accountData);
  }

  confirmationRegistration() {
    this.confirmationStatus = UserConfirmationStatusEnum.CONFIRM;
  }

  updateConfirmationCode({ confirmationCode }: { confirmationCode: string }) {
    this.confirmationCode = confirmationCode;
  }

  updateRecoveryCode({ recoveryCode }: { recoveryCode: string }) {
    this.recoveryCode = recoveryCode;
  }

  addGoogleId({ googleId }: { googleId: string }) {
    this.googleId = googleId;
  }
}
