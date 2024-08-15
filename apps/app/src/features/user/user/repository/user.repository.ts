import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/db/service/prisma-connection.service';
import { UserEntity } from '../class/user.fabric';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(userProfile: Omit<UserEntity, 'id'>) {
    console.log('userProfile in user repository:', userProfile);

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

  async updateUser({ data }: any) {
    return this.prismaService.user.update({
      where: { id: data.id },
      data,
    });
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
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findUserByUserName({ userName }: { userName: string }) {
    return this.prismaService.user.findFirst({
      where: {
        name: userName,
      },
    });
  }

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
