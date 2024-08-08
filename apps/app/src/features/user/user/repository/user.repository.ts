import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/db/service/prisma-connection.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser({ data }: any) {
    await this.prismaService.user.create({
      data: {
        ...data,
      },
    });
  }

  async getAllUsers() {
    return this.prismaService.user.findMany();
  }
}
