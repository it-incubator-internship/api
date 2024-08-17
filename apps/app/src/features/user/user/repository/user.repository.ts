import { Injectable } from '@nestjs/common';
import { UserEntity } from '../class/user.fabric';
import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { UserAccountData, UserConfirmationStatusEnum } from '../class/accoun-data.fabric';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(userProfile: Omit<UserEntity, 'id'>) {
    console.log('userProfile in user repository (createUser):', userProfile);

    try {
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
    } catch (e) {
      console.log(e);
    }
  }

  async updateUser(userProfile: Omit<UserEntity, 'id'>) {
    console.log('userProfile in user repository (createUser):', userProfile);

    try {
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
    } catch (e) {
      console.log(e);
    }
  }

  async updateAccountData(userAccountData: UserAccountData) {
    console.log('userAccountData in user repository (updateAccountData):', userAccountData);
    try {
      return this.prismaService.accountData.update({
        where: {
          profileId: userAccountData.profileId,
        },
        data: {
          recoveryCode: userAccountData.recoveryCode,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getAllUsers() {
    return this.prismaService.user.findMany();
  }

  async findUserById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  async findUserByEmail({ email }: { email: string }) {
    console.log('email in user repository (findUserByEmail):', email);
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log('user in user repository (findUserByEmail):', user);
    return user;
  }

  async findUserByUserName({ userName }: { userName: string }) {
    console.log('userName in user repository (findUserByUserName):', userName);
    const user = await this.prismaService.user.findFirst({
      where: {
        name: userName,
      },
    });
    console.log('user in user repository (findUserByUserName):', user);
    return user;
  }

  async findUserAccountDataById({ id }: { id: string }) {
    console.log('id in user repository (findUserAccountDataById):', id);
    const user = await this.prismaService.accountData.findUnique({
      where: {
        profileId: id,
      },
    });
    console.log('user in user repository (findUserAccountDataById):', user);
    if (!user) {
      return null;
    }
    const result: UserAccountData = UserAccountData.convert(user);
    console.log('result in user repository (findUserAccountDataById):', result);
    return result;
  }

  // email совпадает, userName не совпадает
  // async findUserByEmailOnly({ userName, email }: { userName: string; email: string }) {
  //   console.log('userName in user repository (findUserByUserNameOrEmail):', userName);
  //   console.log('email in user repository (findUserByUserNameOrEmail):', email);
  //   const user = await this.prismaService.user.findFirst({
  //     where: {
  //       email: email, // совпадение только по email
  //       NOT: {
  //         name: userName, // name не должен совпадать
  //       },
  //     },
  //     include: {
  //       accountData: true, // если нужно включить связанные данные
  //     },
  //   });
  //   console.log('user in user repository (findUserByEmailOnly):', user);
  //   return user;
  // }

  // userName совпадает, email не совпадает
  // async findUserByUserNameOnly({ userName, email }: { userName: string; email: string }) {
  //   console.log('userName in user repository (findUserByUserNameOnly):', userName);
  //   console.log('email in user repository (findUserByUserNameOnly):', email);
  //   const user = await this.prismaService.user.findFirst({
  //     where: {
  //       name: userName, // совпадение только по name
  //       NOT: {
  //         email: email, // email не должен совпадать
  //       },
  //     },
  //     include: {
  //       accountData: true, // если нужно включить связанные данные
  //     },
  //   });
  //   console.log('user in user repository (findUserByUserNameOnly):', user);
  //   return user;
  // }

  // поиск user по email, userName и passwordHash
  // async findUserByEmailAndUserName({ userName, email }: { userName: string; email: string }) {
  //   console.log('userName in user repository (findUserByEmailAndUserName):', userName);
  //   console.log('email in user repository (findUserByEmailAndUserName):', email);
  //   const user = await this.prismaService.user.findFirst({
  //     where: {
  //       name: userName,
  //       email: email,
  //       accountData: {
  //         confirmationStatus: UserConfirmationStatusEnum.NOT_CONFIRM,
  //       },
  //     },
  //     include: {
  //       accountData: true,
  //     },
  //   });
  //   console.log('user in user repository (findUserByEmailAndUserName):', user);
  //   return user;
  // }

  async findUserByConfirmationCode(confirmationCode: string) {
    return this.prismaService.accountData.findFirst({
      where: {
        confirmationCode: confirmationCode,
      },
    });
  }

  async findUserByRecoveryCode(recoveryCode: string) {
    return this.prismaService.accountData.findFirst({
      where: {
        recoveryCode: recoveryCode,
      },
    });
  }
}
