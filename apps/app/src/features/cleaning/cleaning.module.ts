import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/database_module/prisma.module';

import { CleaningController } from './controller/cleaning.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CleaningController],
})
export class CleaningModule {}
