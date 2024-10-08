import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ImageStorageAdapter } from '../../common/adapters/img/image.storage.adapter';
import { IMG_PROCESSING_ADAPTER } from '../../common/adapters/img/img-processing-adapter.interface';
import { SharpImgProcessingAdapter } from '../../common/adapters/img/sharp-img-processing.adapter';
import { ConfigurationType } from '../../common/settings/configuration';

import { FileUploadService } from './application/file-upload.service';
import { FileRepository } from './repository/file.repository';
import { FileEntity, FileSchema } from './schema/files.schema';
import { AddAvatarUserHandler } from './application/command/add.avatar.user.command';
import { FileUploadController } from './controller/file-upload.controller';
import { DeleteAvatarUserHandler } from './application/command/delete.avatar.user.command';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'MULTICAST_EXCHANGE',
        useFactory: (configService: ConfigService<ConfigurationType, true>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('apiSettings.RMQ_HOST', { infer: true }) as string],
            queue: 'multicast_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    MongooseModule.forFeature([
      {
        name: FileEntity.name,
        schema: FileSchema,
      },
    ]),
  ],
  controllers: [FileUploadController],
  providers: [
    {
      provide: IMG_PROCESSING_ADAPTER,
      useClass: SharpImgProcessingAdapter, // Используем реализацию на основе sharp
    },
    FileUploadService,
    ImageStorageAdapter,
    FileRepository,
    AddAvatarUserHandler,
    DeleteAvatarUserHandler,
  ],
  exports: [ImageStorageAdapter, FileUploadService],
})
export class FileUploadModule {}
