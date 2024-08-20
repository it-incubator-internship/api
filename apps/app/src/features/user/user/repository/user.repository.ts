import { Injectable } from '@nestjs/common';
import { UserEntity } from '../class/user.fabric';
import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { UserAccountData } from '../class/accoun-data.fabric';
import { UserSession } from '../class/session.fabric';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(userProfile: Omit<UserEntity, 'id'>) {
    console.log('userProfile in user repository (createUser):', userProfile);

    return this.prismaService.user.create({
      data: {
        name: userProfile.name,
        email: userProfile.email,
        passwordHash: userProfile.passwordHash,
        ...(userProfile?.accountData
          ? {
              accountData: {
                create: {
                  confirmationCode: userProfile.accountData!.confirmationCode,
                },
              },
            }
          : {}),
      },
    });
  }

  async updateUser(userProfile: Omit<UserEntity, 'id'>) {
    console.log('userProfile in user repository (updateUser):', userProfile);

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
      console.log('userAccountData in user repository (updateAccountData):', userAccountData);

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

  async createSession(session: Omit<UserSession, 'id'>) {
    console.log('session in user repository (createSession):', session);

    return this.prismaService.session.create({
      data: {
        profileId: session.profileId,
        deviceUuid: session.deviceUuid,
        deviceName: session.deviceName,
        ip: session.ip,
        lastActiveDate: session.lastActiveDate,
      },
    });
  }

  // пока не используется
  async findAllUsers() {
    return this.prismaService.user.findMany();
  }

  async findUserById({ id }: { id: string }) {
    console.log('id in user repository (findUserById):', id);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });
    console.log('user in user repository (findUserById):', user);

    if (!user) {
      return null;
    }

    const result: UserEntity = UserEntity.convert(user);
    console.log('result in user repository (findUserById):', result);
    return result;
  }

  async findUserByEmail({ email }: { email: string }) {
    console.log('email in user repository (findUserByEmail):', email);

    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    console.log('user in user repository (findUserByEmail):', user);

    if (!user) {
      return null;
    }

    const result: UserEntity = UserEntity.convert(user);
    console.log('result in user repository (findUserById):', result);
    return result;
  }

  async findUserByUserName({ userName }: { userName: string }) {
    console.log('userName in user repository (findUserByUserName):', userName);
    const user = await this.prismaService.user.findFirst({
      where: {
        name: userName,
      },
    });
    console.log('user in user repository (findUserByUserName):', user);

    if (!user) {
      return null;
    }

    const result: UserEntity = UserEntity.convert(user);
    console.log('result in user repository (findUserById):', result);
    return result;
  }

  async findAccountDataById({ id }: { id: string }) {
    console.log('id in user repository (findAccountDataById):', id);

    const user = await this.prismaService.accountData.findUnique({
      where: {
        profileId: id,
      },
    });
    console.log('user in user repository (findAccountDataById):', user);

    if (!user) {
      return null;
    }

    const result: UserAccountData = UserAccountData.convert(user);
    console.log('result in user repository (findAccountDataById):', result);
    return result;
  }

  async findAccountDataByConfirmationCode({ confirmationCode }: { confirmationCode: string }) {
    console.log('confirmationCode in user repository (findAccountDataByConfirmationCode):', confirmationCode);

    const user = await this.prismaService.accountData.findFirst({
      where: {
        confirmationCode: confirmationCode,
      },
    });
    console.log('user in user repository (findAccountDataByConfirmationCode):', user);

    if (!user) {
      return null;
    }

    const result: UserAccountData = UserAccountData.convert(user);
    console.log('result in user repository (findAccountDataByConfirmationCode):', result);
    return result;
  }

  async findAccountDataByRecoveryCode({ recoveryCode }: { recoveryCode: string }) {
    console.log('recoveryCode in user repository (findAccountDataByRecoveryCode):', recoveryCode);

    const user = await this.prismaService.accountData.findFirst({
      where: {
        recoveryCode: recoveryCode,
      },
    });
    console.log('user in user repository (findAccountDataByRecoveryCode):', user);

    if (!user) {
      return null;
    }

    const result: UserAccountData = UserAccountData.convert(user);
    console.log('result in user repository (findAccountDataByRecoveryCode):', result);
    return result;
  }
}
