import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BaseController } from '../../common/controller/base.controller';
import { BaseRepository } from '../../../apps/common/repository/base.repository';
import { EntityHandler } from '../../common/repository/entity.handler';

import { AppController } from './app.controller';
import { UserModule } from './features/user/user.module';
import { configuration } from './common/settings/configuration';
import { Environments } from './common/settings/env_validate/env-class-validator';
import { getEnvFilePath, isEnvFileIgnored } from './common/settings/determinate-env-path';
import { UserRepository } from './features/user/user/repository/user.repository';
import { SessionRepository } from './features/user/auth/repository/session.repository';
import { PrismaService } from './common/database_module/prisma-connection.service';
import { CleaningModule } from './features/cleaning/cleaning.module';

const environment = process.env.NODE_ENV as Environments;

const ybrat = [UserRepository, SessionRepository, PrismaService, BaseRepository, EntityHandler];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(environment),
      ignoreEnvFile: isEnvFileIgnored(environment),
      load: [configuration],
    }),
    UserModule,
    CleaningModule,
  ],
  controllers: [AppController, BaseController],
  providers: [...ybrat],
  exports: [],
})
export class AppModule {}
