import { User } from '../../../../../prisma/client';

// import bcrypt from 'bcrypt';
// import { randomUUID } from 'crypto';
import { UserAccountData } from './accoun-data.fabric';

enum UserBanStatusEnum {
  BANNED = 'BANNED',
  NOT_BANNED = 'NOT_BANNED',
}

export class UserEntity implements User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  passwordHash: string;
  banStatus: UserBanStatusEnum;
  banDate: Date | null;
  accountData?: UserAccountData;

  static create({
    name,
    email,
    /* password, */ passwordHash,
    accountData = null,
  }: {
    name: string;
    email: string;
    /* password */ passwordHash: string;
    accountData?: {
      confirmationCode: string;
    } | null;
  }): Omit<UserEntity, 'id'> {
    console.log('name in user fabric:', name);
    console.log('email in user fabric:', email);
    console.log('passwordHash in user fabric:', passwordHash);
    console.log('accountData in user fabric:', accountData);

    const userProfileDto: {
      name: string;
      email: string;
      // deletedAt: Date | null;
      passwordHash: string;
      // confirmationCode: string;
      accountData?: object;
    } = {
      email,
      name,
      // deletedAt: null,
      passwordHash /*bcrypt.hashSync(password, 10)*/,
      // confirmationCode: accountData?.confirmationCode /*: randomUUID()*/,
    };

    console.log('userProfileDto in user fabric:', userProfileDto);

    if (accountData) {
      userProfileDto.accountData = UserAccountData.create({ confirmationCode: accountData.confirmationCode });
    }

    console.log('userProfileDto in user fabric:', userProfileDto);

    return Object.assign(new this(), userProfileDto);
  }

  // метод для преобразования в "умную" модель
  static convert(user: User): UserEntity {
    return Object.assign(new this(), user);
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
