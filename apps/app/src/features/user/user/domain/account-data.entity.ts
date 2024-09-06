import { $Enums, AccountData, Prisma, Session, User } from '../../../../../prisma/client';

import BanStatus = $Enums.BanStatus;
import ConfirmationStatus = $Enums.ConfirmationStatus;

export class UserEntityNEW implements User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  passwordHash: string;
  banStatus: BanStatus;
  banDate: Date | null;
  accountData?: AccountDataEntityNEW | null;
  sessions?: SessionEntityNEW[];

  constructor(
    user: User & {
      accountData?: AccountData | null;
      sessions?: Session[];
    },
  ) {
    Object.assign(this, user);

    if (user.accountData) {
      this.accountData = new AccountDataEntityNEW(user.accountData);
    }

    if (user.sessions) {
      this.sessions = user.sessions.map((session) => new SessionEntityNEW(session));
    }
  }

  static createForDatabase(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'banStatus' | 'banDate'>,
  ): Prisma.UserCreateInput {
    return {
      name: data.name,
      email: data.email.toLowerCase(),
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
    this.banStatus = BanStatus.BANNED;
    this.banDate = new Date();
  }

  unbanUser() {
    this.banStatus = BanStatus.NOT_BANNED;
    this.banDate = null;
  }
}

export class AccountDataEntityNEW implements AccountData {
  profileId: string;
  confirmationStatus: ConfirmationStatus;
  confirmationCode: string;
  recoveryCode: string | null;
  githubId: string | null;
  googleId: string | null;
  user?: UserEntityNEW | null;

  constructor(accountData: AccountData & { user?: User | null }) {
    Object.assign(this, accountData);

    if (accountData.user) {
      this.user = new UserEntityNEW(accountData.user);
    }
  }

  static createForDatabase(data: Omit<AccountData, 'user'>): Prisma.AccountDataCreateInput {
    return {
      user: { connect: { id: data.profileId } },
      confirmationCode: data.confirmationCode,
      recoveryCode: data.recoveryCode,
      githubId: data.githubId || null,
      googleId: data.googleId || null,
      confirmationStatus: data.confirmationStatus,
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

export class SessionEntityNEW implements Session {
  id: string;
  profileId: string;
  deviceUuid: string;
  deviceName: string;
  ip: string;
  lastActiveDate: Date;
  user?: UserEntityNEW;

  constructor(session: Session & { user?: User }) {
    Object.assign(this, session);

    if (session.user) {
      this.user = new UserEntityNEW(session.user);
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
  ): UserEntityNEW {
    return new UserEntityNEW(data);
  }

  static createAccountData(
    data: AccountData & {
      user?: User | null;
    },
  ): AccountDataEntityNEW {
    return new AccountDataEntityNEW(data);
  }

  static createSession(
    data: Session & {
      user?: User;
    },
  ): SessionEntityNEW {
    return new SessionEntityNEW(data);
  }
}
