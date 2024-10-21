import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { ImageStorageAdapter } from '../../common/adapters/img/image.storage.adapter';
import { IMG_PROCESSING_ADAPTER } from '../../common/adapters/img/img-processing-adapter.interface';
import { SharpImgProcessingAdapter } from '../../common/adapters/img/sharp-img-processing.adapter';
import { RmqModule } from '../rmq-provider/rmq.module';
import { BrokerModule } from '../broker/broker.module';

import { FileUploadService } from './application/file-upload.service';
import { FileRepository } from './repository/file.repository';
import { FileEntity, FileSchema } from './schema/files.schema';
import { AddAvatarUserHandler } from './application/command/add.avatar.user.command';
import { FileUploadController } from './controller/file-upload.controller';
import { DeleteAvatarUrlUserHandler } from './application/command/delete.avatar.url.user.command';
import { DeleteAvatarUserHandler } from './application/command/delete.avatar.user.command';
import { SendEventHandler } from './application/command/send.event.command';
import { EventRepository } from './repository/event.repository';
import { EventEntity, EventSchema } from './schema/events.schema';

@Module({
  imports: [
    RmqModule,
    CqrsModule,
    ConfigModule,
    BrokerModule,
    MongooseModule.forFeature([
      {
        name: FileEntity.name,
        schema: FileSchema,
      },
      {
        name: EventEntity.name,
        schema: EventSchema,
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
    EventRepository,
    AddAvatarUserHandler,
    DeleteAvatarUrlUserHandler,
    DeleteAvatarUserHandler,
    SendEventHandler,
  ],
  exports: [ImageStorageAdapter, FileUploadService, FileRepository, EventRepository],
})
export class FileUploadModule {}
