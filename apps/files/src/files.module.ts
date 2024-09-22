import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { Environments } from './common/settings/env_validate/env-class-validator';
import { getEnvFilePath, isEnvFileIgnored } from './common/settings/determinate-env-path';
import { configuration } from './common/settings/configuration';
import { ImageStorageAdapter } from './common/adapters/image.storage.adapter';
import { FileController } from './features/files/controller/file.controller';

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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('databaseSettings.uri'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [FilesController, FileController],
  providers: [FilesService, ImageStorageAdapter],
})
export class FilesModule {}
