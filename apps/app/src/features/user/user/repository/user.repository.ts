import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { Prisma, User } from '../../../../../prisma/client';
import { AccountDataEntityNEW, EntityFactory, UserEntityNEW } from '../domain/account-data.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(user: Prisma.UserCreateInput) {
    const newUser: User = await this.prismaService.user.create({ data: user });
    return EntityFactory.createUser(newUser);
  }

  async createAccountData(userAccountData: Prisma.AccountDataCreateInput) {
    const accountData = await this.prismaService.accountData.create({ data: userAccountData });
    return EntityFactory.createAccountData(accountData);
  }

  async updateUser(userProfile: UserEntityNEW) {
    return this.prismaService.user.update({
      where: {
        email: userProfile.email,
        name: userProfile.name,
      },
      data: {
        passwordHash: userProfile.passwordHash,
        accountData: userProfile?.accountData
          ? {
              update: {
                confirmationCode: userProfile.accountData!.confirmationCode,
              },
            }
          : undefined,
      },
    });
  }

  async updateAccountData(userAccountData: AccountDataEntityNEW) {
    try {
      return this.prismaService.accountData.update({
        where: {
          profileId: userAccountData.profileId,
        },
        data: {
          recoveryCode: userAccountData.recoveryCode,
          confirmationCode: userAccountData.confirmationCode,
          confirmationStatus: userAccountData.confirmationStatus,
          googleId: userAccountData.googleId,
        },
      });
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  async findAllUsers() {
    return this.prismaService.user.findMany();
  }

  async findUserById({ id }: { id: string }): Promise<UserEntityNEW | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return null;
    }

    return EntityFactory.createUser(user);
  }

  async findAccountDataByGoogleId({ googleId }: { googleId: string }): Promise<AccountDataEntityNEW | null> {
    const accountData = await this.prismaService.accountData.findUnique({
      where: {
        googleId: googleId,
      },
    });

    if (!accountData) {
      return null;
    }

    return EntityFactory.createAccountData(accountData);
  }

  async findUserByEmailOrName({ email, name }: { email: string; name: string }) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: email,
              mode: 'insensitive',
            },
          },
          {
            name: {
              equals: name,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    if (!user) return null;

    return EntityFactory.createUser(user);
  }

  async findUserByEmail({ email }: { email: string }): Promise<UserEntityNEW | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      return null;
    }

    return EntityFactory.createUser(user);
  }

  async findUserByUserName({ userName }: { userName: string }): Promise<UserEntityNEW | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        name: {
          equals: userName,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      return null;
    }

    return EntityFactory.createUser(user);
  }

  async findAccountDataById({ id }: { id: string }): Promise<AccountDataEntityNEW | null> {
    const user = await this.prismaService.accountData.findUnique({
      where: {
        profileId: id,
      },
    });

    if (!user) {
      return null;
    }

    return EntityFactory.createAccountData(user);
  }

  async addAccountDataGitHubProvider({ userId, providerId }: { userId: string; providerId: string }) {
    return this.prismaService.accountData.update({
      where: {
        profileId: userId,
      },
      data: {
        githubId: providerId,
      },
    });
  }

  async findAccountDataByConfirmationCode({
    confirmationCode,
  }: {
    confirmationCode: string;
  }): Promise<AccountDataEntityNEW | null> {
    const user = await this.prismaService.accountData.findFirst({
      where: {
        confirmationCode: confirmationCode,
      },
    });

    if (!user) {
      return null;
    }

    return EntityFactory.createAccountData(user);
  }

  async findAccountDataByRecoveryCode({
    recoveryCode,
  }: {
    recoveryCode: string;
  }): Promise<AccountDataEntityNEW | null> {
    const user = await this.prismaService.accountData.findFirst({
      where: {
        recoveryCode: recoveryCode,
      },
    });

    if (!user) {
      return null;
    }

    return EntityFactory.createAccountData(user);
  }
}
