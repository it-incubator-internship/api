import { User } from '../../../../../prisma/client';

import { UserAccountData } from './accoun-data.fabric';
import { UserRegistrationEvent } from './events/user-registration.event';

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
  events: any[] = [];

  static create({
    name,
    email,
    passwordHash,
    accountData = null,
  }: {
    name: string;
    email: string;
    passwordHash: string;
    accountData?: {
      confirmationCode: string;
    } | null;
  }): Omit<UserEntity, 'id'> {
    const userProfileDto: {
      name: string;
      email: string;
      passwordHash: string;
      accountData?: object;
      events?: object[];
    } = {
      email,
      name,
      passwordHash,
      events: [],
    };

    if (accountData) {
      userProfileDto.accountData = UserAccountData.create({ confirmationCode: accountData.confirmationCode });
      const event = new UserRegistrationEvent(name, email, accountData.confirmationCode);
      userProfileDto.events!.push(event);
    }

    return Object.assign(new this(), userProfileDto);
  }

  // метод для преобразования в "умную" модель
  static convert(user: User): UserEntity {
    return Object.assign(new this(), user);
  }

  // метод для удалёния юзера
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
