import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/db/service/prisma-connection.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

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
