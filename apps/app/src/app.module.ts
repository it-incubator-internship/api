import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { UserModule } from './features/user/user.module';
import { configuration } from './common/settings/configuration';
import { Environments } from './common/settings/env_validate/env-class-validator';
import { getEnvFilePath, isEnvFileIgnored } from './common/settings/determinate-env-path';
import { CleaningController } from './features/cleaning/controller/cleaning.controller';
import { UserRepository } from './features/user/user/repository/user.repository';
import { SessionRepository } from './features/user/auth/repository/session.repository';
import { PrismaService } from './common/database_module/prisma-connection.service';

const environment = process.env.NODE_ENV as Environments;

const ybrat = [UserRepository, SessionRepository, PrismaService];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(environment),
      ignoreEnvFile: isEnvFileIgnored(environment),
      load: [configuration],
    }),
    UserModule,
  ],
  controllers: [AppController, CleaningController],
  providers: [...ybrat],
  exports: [],
})
export class AppModule {}
