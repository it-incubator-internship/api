import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// import { CqrsModule } from '@nestjs/cqrs';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { Environments } from './common/settings/env_validate/env-class-validator';
import { getEnvFilePath, isEnvFileIgnored } from './common/settings/determinate-env-path';
import { configuration } from './common/settings/configuration';
import { FileUploadModule } from './features/files/files-upload.module';
// import { ImageStorageAdapter } from './common/adapters/img/image.storage.adapter';
// import { FileController } from './features/files/controller/file.controller';
// import { DeleteAvatarUserHandler } from './features/files/application/command/delete.avatar.user.command';
// import { FileRepository } from './features/files/repository/file.repository';
// import { AddAvatarUserHandler } from './features/files/application/command/add.avatar.user.command';
// import { FileEntity, FileSchema } from './features/files/schema/files.schema';
// import { FileSchema } from './features/files/schema/files.schema';

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
    // CqrsModule,
    // MongooseModule.forFeature([{ name: Files.name, schema: FileSchema }]),
    // MongooseModule.forFeature([{ name: FileEntity.name, schema: FileSchema }]),
    FileUploadModule,
  ],
  controllers: [FilesController /* , FileController */],
  providers: [
    FilesService,
    /* ImageStorageAdapter, */
    /* AddAvatarUserHandler, */ /* DeleteAvatarUserHandler, */ /* FileRepository, */
  ],
})
export class FilesModule {}
