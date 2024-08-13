import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/db/service/prisma-connection.service';
import { UserEntity } from '../class/user.fabric';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createProfile(userProfile: Omit<UserEntity, 'id'>) {
    console.log('userProfile in user repository:', userProfile);
    try {
      return this.prismaService.user.create({
        data: {
          name: userProfile.name,
          email: userProfile.email,
          passwordHash: userProfile.passwordHash,
          accountData: {
            create: {
              confirmationCode: userProfile.accountData!.confirmationCode,
            },
          },
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

  async findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
  }
}
