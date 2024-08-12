import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/app/src/common/db/service/prisma-connection.service';
import { UserProfile } from '../class/user.class';
import { randomUUID } from 'crypto';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createProfile(userProfile: Omit<UserProfile, 'id'>) {
    try {
      return this.prismaService.profile.create({
        data: userProfile,
        accountData: {
          create: [
            {
              passwordHash: userProfile.passwordHash,
              confirmationCode: '123123123',
              recoveryCode: null,
              banDate: null,
            },
          ],
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  async createUser({ data }: any) {
    return this.prismaService.user.create({
      data: {
        email: data.email,
        name: data.name,
      },
    });
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

  //   async findUserByConfirmationCode(code: string) {
  //     return this.prismaService.user.findUnique({
  //       where: {
  //         code: code,
  //       },
  //     });
  //   }

  //   async findUserByRecoveryCode(code: string) {
  //     return this.prismaService.user.findUnique({
  //       where: {
  //         code: code,
  //       },
  //     });
  //   }

  async findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
  }
}
