import { Controller, Delete } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { PrismaService } from '../../../../../app/src/common/database_module/prisma-connection.service';

//TODO вынести в отдельный модуль
@ApiExcludeController()
@Controller('testing')
export class CleaningController {
  constructor(private readonly prismaService: PrismaService) {}

  @Delete('all-data')
  async deleteAllData() {
    await this.prismaService.session.deleteMany();
    await this.prismaService.accountData.deleteMany();
    await this.prismaService.user.deleteMany();
  }
}
