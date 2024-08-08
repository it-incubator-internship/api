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

  async getAllUsers() {
    return this.prismaService.user.findMany();
  }
}
