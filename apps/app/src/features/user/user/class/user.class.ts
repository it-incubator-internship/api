import { AccountData, Profile, Session } from 'apps/app/prisma/client';

// export class ProfileWrapper extends Profile {   // попытка согласно chatGPT
//   constructor(profile: Profile) {
//     super();
//     Object.assign(this, profile);
//   }
// }

interface ProfileInterface extends Profile {}

export class UserProfile implements ProfileInterface {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  //возможно делать айди
  static create({ name, email }: { name: string; email: string }): Omit<UserProfile, 'id'> {
    const userProfileDto = {
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    return Object.assign(new this(), userProfileDto);
  }

  // метод для преобразования в "умную" модель
  static convert(profile: Profile): UserProfile {
    return Object.assign(new this(), profile);
  }

  deleteUserProfile() {
    this.deletedAt = new Date();
  }

  // метод для восстановления удалённого юзера
  restoreUserProfile() {
    this.deletedAt = null;
  }

  updateUserProfile(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
}

enum UserConfirmationStatusEnum {
  CONFIRM = 'CONFIRM',
  NOT_CONFIRM = 'NOT_CONFIRM',
}

enum UserBanStatusEnum {
  BANNED = 'BANNED',
  NOT_BANNED = 'NOT_BANNED',
}

interface AccountDataInterface extends AccountData {}

export class UserAccountData implements AccountDataInterface {
  profileId: string;
  passwordHash: string;
  confirmationStatus: UserConfirmationStatusEnum;
  confirmationCode: string;
  recoveryCode: string | null;
  banStatus: UserBanStatusEnum;
  banDate: Date | null;

  constructor(private readonly accountData: AccountData) {
    Object.assign(this, accountData);
  }

  static create({
    profileId,
    passwordHash,
    confirmationCode,
  }: {
    profileId: string;
    passwordHash: string;
    confirmationCode: string;
  }): AccountData {
    const userAccountData = {
      profileId,
      passwordHash,
      confirmationStatus: UserConfirmationStatusEnum.NOT_CONFIRM,
      confirmationCode,
      recoveryCode: null,
      banStatus: UserBanStatusEnum.NOT_BANNED,
      banDate: null,
    };
    return userAccountData;
  }

  // метод для преобразования в "умную" модель
  static convert(accountData: AccountData) {
    const userAccountData = new this(accountData);
    return userAccountData;
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

  updatePasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;
  }

  banUser() {
    this.banStatus = UserBanStatusEnum.BANNED;
    this.banDate = new Date();
  }

  unbanUser() {
    this.banStatus = UserBanStatusEnum.NOT_BANNED;
    this.banDate = null;
  }
}

interface SessionInterface extends Session {}

export class UserSession implements SessionInterface {
  id: string;
  profileId: string;
  deviceName: string;
  ip: string;
  lastActiveDate: Date;

  constructor(private readonly session: Session) {
    Object.assign(this, session);
  }

  // в этом случае этот метод будет применяться и для создания и для преобразования в "умную" модель
  static create(session: Session) {
    const userSession = new this(session);
    return userSession;
  }

  updateLastActiveDate(lastActiveDate: Date) {
    this.lastActiveDate = lastActiveDate;
  }
}
