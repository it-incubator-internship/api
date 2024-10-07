import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ImageStorageAdapter } from '../../common/adapters/img/image.storage.adapter';
import { IMG_PROCESSING_ADAPTER } from '../../common/adapters/img/img-processing-adapter.interface';
import { SharpImgProcessingAdapter } from '../../common/adapters/img/sharp-img-processing.adapter';
import { RmqModuleX } from '../rmq-provider/rmq.module';

import { FileUploadService } from './applications/file-upload.service';
import { FileRepository } from './repository/file.repository';
import { FileEntity, FileSchema } from './schema/files.schema';
import { AddAvatarUserHandler } from './application/command/add.avatar.user.command';
import { FileUploadController } from './controller/file-upload.controller';
import { DeleteAvatarUrlUserHandler } from './application/command/delete.avatar.url.user.command';
import { DeleteAvatarUserHandler } from './application/command/delete.avatar.user.command';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    ClientsModule.register([
      {
        name: 'MULTICAST_EXCHANGE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://navaibeadmin:navaibeadmin@91.108.243.169:5672/test_vhost'],
          //TODO 'multicast_queue
          queue: 'multicast_queue_local',
          queueOptions: {
            durable: true,
          },
        },
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
    RmqModuleX,
    FileUploadService,
    ImageStorageAdapter,
    FileRepository,
    AddAvatarUserHandler,
    DeleteAvatarUrlUserHandler,
    DeleteAvatarUserHandler,
  ],
  exports: [ImageStorageAdapter, FileUploadService, FileRepository],
})
export class FileUploadModule {}
