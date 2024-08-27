import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { UserEntity } from '../domain/user.fabric';
import { UserAccountData } from '../domain/accoun-data.fabric';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(userProfile: Omit<UserEntity, 'id'>) {
    return this.prismaService.user.create({
      data: {
        name: userProfile.name,
        email: userProfile.email,
        passwordHash: userProfile.passwordHash,
        ...(userProfile?.accountData
          ? {
              accountData: {
                create: {
                  ...userProfile.accountData!,
                },
              },
            }
          : {}),
      },
    });
  }

  async updateUser(userProfile: Omit<UserEntity, 'id'>) {
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

  async updateAccountData(userAccountData: UserAccountData) {
    try {
      return this.prismaService.accountData.update({
        where: {
          profileId: userAccountData.profileId,
        },
        data: {
          recoveryCode: userAccountData.recoveryCode,
          confirmationCode: userAccountData.confirmationCode,
          confirmationStatus: userAccountData.confirmationStatus,
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

  async findUserById({ id }: { id: string }): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return null;
    }

    return UserEntity.convert(user);
  }

  async findByEmailOrName({ email, name }: { email: string; name: string }) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            name: name,
          },
        ],
      },
    });
  }

  async findUserByEmail({ email }: { email: string }): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return null;
    }

    return UserEntity.convert(user);
  }

  async findUserByUserName({ userName }: { userName: string }): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        name: userName,
      },
    });

    if (!user) {
      return null;
    }

    return UserEntity.convert(user);
  }

  async findAccountDataById({ id }: { id: string }): Promise<UserAccountData | null> {
    const user = await this.prismaService.accountData.findUnique({
      where: {
        profileId: id,
      },
    });

    if (!user) {
      return null;
    }

    return UserAccountData.convert(user);
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
  }): Promise<UserAccountData | null> {
    const user = await this.prismaService.accountData.findFirst({
      where: {
        confirmationCode: confirmationCode,
      },
    });

    if (!user) {
      return null;
    }

    return UserAccountData.convert(user);
  }

  async findAccountDataByRecoveryCode({ recoveryCode }: { recoveryCode: string }): Promise<UserAccountData | null> {
    const user = await this.prismaService.accountData.findFirst({
      where: {
        recoveryCode: recoveryCode,
      },
    });

    if (!user) {
      return null;
    }

    return UserAccountData.convert(user);
  }

  // применяется для очистки БД при тестировании
  async deleteAllUsers() {
    await this.prismaService.accountData.deleteMany();
    await this.prismaService.user.deleteMany();
  }
}
