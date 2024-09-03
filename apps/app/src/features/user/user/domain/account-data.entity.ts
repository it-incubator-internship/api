import { $Enums, AccountData, Prisma, Session, User } from '../../../../../prisma/client';

import { UserBanStatusEnum } from './user.fabric';

import BanStatus = $Enums.BanStatus;
import ConfirmationStatus = $Enums.ConfirmationStatus;

export class UserEntity implements User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  passwordHash: string;
  banStatus: BanStatus;
  banDate: Date | null;
  accountData?: AccountDataEntity | null;
  sessions?: SessionEntity[];

  constructor(
    user: User & {
      accountData?: AccountData | null;
      sessions?: Session[];
    },
  ) {
    Object.assign(this, user);

    if (user.accountData) {
      this.accountData = new AccountDataEntity(user.accountData);
    }

    if (user.sessions) {
      this.sessions = user.sessions.map((session) => new SessionEntity(session));
    }
  }

  static createForDatabase(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'banStatus' | 'banDate'>,
  ): Prisma.UserCreateInput {
    return {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      banStatus: 'NOT_BANNED',
    };
  }

  deleteUserProfile() {
    this.deletedAt = new Date();
  }

  restoreUserProfile() {
    this.deletedAt = null;
  }

  updateUserProfile(name: string, email: string) {
    this.name = name;
    this.email = email;
  }

  updatePasswordHash({ passwordHash }: { passwordHash: string }) {
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

export class AccountDataEntity implements AccountData {
  profileId: string;
  confirmationStatus: ConfirmationStatus;
  confirmationCode: string;
  recoveryCode: string | null;
  githubId: string | null;
  googleId: string | null;
  user?: UserEntity | null;

  constructor(accountData: AccountData & { user?: User | null }) {
    Object.assign(this, accountData);

    if (accountData.user) {
      this.user = new UserEntity(accountData.user);
    }
  }

  static createForDatabase(data: Omit<AccountData, 'confirmationStatus' | 'user'>): Prisma.AccountDataCreateInput {
    return {
      user: { connect: { id: data.profileId } },
      confirmationCode: data.confirmationCode,
      recoveryCode: data.recoveryCode,
      githubId: data.githubId,
      googleId: data.googleId,
      confirmationStatus: 'NOT_CONFIRM',
    };
  }

  confirmationRegistration() {
    this.confirmationStatus = ConfirmationStatus.CONFIRM;
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

export class SessionEntity implements Session {
  id: string;
  profileId: string;
  deviceUuid: string;
  deviceName: string;
  ip: string;
  lastActiveDate: Date;
  user?: UserEntity;

  constructor(session: Session & { user?: User }) {
    Object.assign(this, session);

    if (session.user) {
      this.user = new UserEntity(session.user);
    }
  }

  static createForDatabase(
    data: Omit<Prisma.SessionCreateInput, 'user'> & { profileId: string },
  ): Prisma.SessionCreateInput {
    return {
      deviceUuid: data.deviceUuid,
      deviceName: data.deviceName,
      ip: data.ip,
      lastActiveDate: data.lastActiveDate,
      user: { connect: { id: data.profileId } },
    };
  }

  updateLastActiveDate({ lastActiveDate }: { lastActiveDate: Date }) {
    this.lastActiveDate = lastActiveDate;
  }
}

export class EntityFactory {
  static createUser(
    data: User & {
      accountData?: AccountData | null;
      sessions?: Session[];
    },
  ): UserEntity {
    return new UserEntity(data);
  }

  static createAccountData(
    data: AccountData & {
      user?: User | null;
    },
  ): AccountDataEntity {
    return new AccountDataEntity(data);
  }

  static createSession(
    data: Session & {
      user?: User;
    },
  ): SessionEntity {
    return new SessionEntity(data);
  }
}
