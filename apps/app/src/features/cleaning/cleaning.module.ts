import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/database_module/prisma.module';

import { CleaningController } from './controller/cleaning.controller';
import { CleaningService } from './cleaning.service';

@Module({
  imports: [PrismaModule],
  providers: [CleaningService],
  controllers: [CleaningController],
  exports: [CleaningService],
})
export class CleaningModule {}
