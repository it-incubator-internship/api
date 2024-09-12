import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/database_module/prisma-connection.service';

@Injectable()
export class CleaningService {
  constructor(private readonly prismaService: PrismaService) {}

  async cleanDB() {
    await this.prismaService.session.deleteMany();
    await this.prismaService.profile.deleteMany();
    await this.prismaService.accountData.deleteMany();
    await this.prismaService.user.deleteMany();
  }
}
