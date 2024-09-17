import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { Environments } from './common/settings/env_validate/env-class-validator';
import { getEnvFilePath, isEnvFileIgnored } from './common/settings/determinate-env-path';
import { configuration } from './common/settings/configuration';

const environment = process.env.NODE_ENV as Environments;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(environment),
      ignoreEnvFile: isEnvFileIgnored(environment),
      load: [configuration],
    }),

    // TODO подключение к тестовой бд
    MongooseModule.forRoot(
      'mongodb+srv://aliakseiyarmolinforit:g1P7fYdgbUQCt4BW@cluster0.moag3kp.mongodb.net/intership-development?retryWrites=true&w=majority',
    ),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
