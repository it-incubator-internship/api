import { $Enums, AccountData, Prisma, Profile, Session, User } from '../../../../../prisma/client';

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
  profile?: ProfileEntityNEW | null;
  sessions?: SessionEntityNEW[];

  constructor(
    user: User & {
      accountData?: AccountData | null;
      profile?: ProfileEntityNEW | null;
      sessions?: Session[];
    },
  ) {
    Object.assign(this, user);

    if (user.accountData) {
      this.accountData = new AccountDataEntityNEW(user.accountData);
    }

    if (user.profile) {
      this.profile = new ProfileEntityNEW(user.profile);
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

  updateUserName({ name }: { name: string }) {
    this.name = name;
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

export class ProfileEntityNEW implements Profile {
  profileId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  country: string | null;
  city: string | null;
  aboutMe: string | null;
  avatarUrl: string | null;
  user?: UserEntityNEW | null;

  constructor(profile: Profile & { user?: User | null }) {
    Object.assign(this, profile);

    if (profile.user) {
      this.user = new UserEntityNEW(profile.user);
    }
  }

  static createForDatabase(
    data: Omit<Prisma.ProfileCreateInput, 'user'> & { profileId: string },
  ): Prisma.ProfileCreateInput {
    return {
      user: { connect: { id: data.profileId } },
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth || null,
      country: data.country || null,
      city: data.city || null,
      aboutMe: data.aboutMe || null,
      // avatarUrl: data.avatarUrl || null,
    };
  }

  updateUserProfile({
    firstName,
    lastName,
    dateOfBirth,
    country,
    city,
    aboutMe,
  }: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    country: string | null;
    city: string | null;
    aboutMe: string | null;
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.dateOfBirth = dateOfBirth;
    this.country = country;
    this.city = city;
    this.aboutMe = aboutMe;
  }

  addAvatarUrl({ avatarUrl }: { avatarUrl: string }) {
    console.log('avatarUrl in account data entity:', avatarUrl);
    this.avatarUrl = avatarUrl;
  }

  deleteAvatarUrl() {
    this.avatarUrl = null;
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

  static createProfile(
    data: Profile & {
      user?: User;
    },
  ): ProfileEntityNEW {
    return new ProfileEntityNEW(data);
  }
}
