import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { UserModule } from './features/user/user.module';
import { configuration } from './common/settings/configuration';
import { Environments } from './common/settings/env_validate/env-class-validator';
import { getEnvFilePath, isEnvFileIgnored } from './common/settings/determinate-env-path';
import { CleaningModule } from './features/cleaning/cleaning.module';
import { RmqModule } from './features/rmq-provider/rmq.module';
import { EventShedulerModule } from './sheduler/event-sheduler.module';
import { FileModule } from './features/file/file.module';

const environment = process.env.NODE_ENV as Environments;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(environment),
      ignoreEnvFile: isEnvFileIgnored(environment),
      load: [configuration],
    }),
    UserModule,
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    RmqModule,
    CleaningModule,
    EventShedulerModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [],
  exports: [],
})
export class AppModule {}
