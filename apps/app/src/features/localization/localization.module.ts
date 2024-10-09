import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/database_module/prisma.module';

import { LocalizationQueryRepository } from './repository/localization.repository';
import { LocalizationController } from './controller/localization.controller';

@Module({
  imports: [PrismaModule],
  providers: [LocalizationQueryRepository],
  controllers: [LocalizationController],
  exports: [],
})
export class LocalizationModule {}
