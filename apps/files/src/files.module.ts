import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FilesService } from './files.service';
import { Environments } from './common/settings/env_validate/env-class-validator';
import { getEnvFilePath, isEnvFileIgnored } from './common/settings/determinate-env-path';
import { configuration } from './common/settings/configuration';
import { FileUploadModule } from './features/files/files-upload.module';
import { MainController } from './files.controller';
import { AvatarShedulerModule } from './sheduler/avatar-sheduler.module';
import { RmqModuleX } from './features/rmq-provider/rmq.module';

const environment = process.env.NODE_ENV as Environments;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(environment),
      ignoreEnvFile: isEnvFileIgnored(environment),
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('databaseSettings.uri'),
      }),
      inject: [ConfigService],
    }),
    RmqModuleX,
    FileUploadModule,
    AvatarShedulerModule,
  ],
  controllers: [MainController],
  providers: [FilesService],
})
export class FilesModule {}
