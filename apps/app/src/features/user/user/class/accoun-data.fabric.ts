import { AccountData } from '../../../../../prisma/client';

enum UserConfirmationStatusEnum {
  CONFIRM = 'CONFIRM',
  NOT_CONFIRM = 'NOT_CONFIRM',
}

export class UserAccountData implements AccountData {
  profileId: string;
  confirmationStatus: UserConfirmationStatusEnum;
  confirmationCode: string;
  recoveryCode: string | null;

  static create({ confirmationCode }: { confirmationCode: string }): Omit<AccountData, 'profileId'> {
    const userAccountData = {
      confirmationCode,
    };
    console.log('userAccountData in account data fabric:', userAccountData);
    return Object.assign(new this(), userAccountData);
  }

  // метод для преобразования в "умную" модель
  static convert(accountData: AccountData) {
    return Object.assign(new this(), accountData);
  }

  confirmationRegistration() {
    this.confirmationStatus = UserConfirmationStatusEnum.CONFIRM;
  }

  updateConfirmationCode(confirmationCode: string) {
    this.confirmationCode = confirmationCode;
  }

  updateRecoveryCode(recoveryCode: string) {
    this.recoveryCode = recoveryCode;
  }
}
