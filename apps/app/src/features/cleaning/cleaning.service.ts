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

  async deleteUserById({ id }: { id: string }) {
    try {
      await this.prismaService.session.deleteMany({ where: { profileId: id } });
    } catch (e) {
      console.log(e);
    }
    try {
      await this.prismaService.profile.delete({ where: { profileId: id } });
    } catch (e) {
      console.log(e);
    }
    try {
      await this.prismaService.accountData.delete({ where: { profileId: id } });
    } catch (e) {
      console.log(e);
    }
    try {
      await this.prismaService.user.delete({ where: { id: id } });
    } catch (e) {
      console.log(e);
    }
  }
}
