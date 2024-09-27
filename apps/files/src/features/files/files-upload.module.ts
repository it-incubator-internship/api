import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { ImageStorageAdapter } from '../../common/adapters/img/image.storage.adapter';
import { IMG_PROCESSING_ADAPTER } from '../../common/adapters/img/img-processing-adapter.interface';
import { SharpImgProcessingAdapter } from '../../common/adapters/img/sharp-img-processing.adapter';

import { FileUploadController } from './controller/file-upload.controller';
import { FileUploadService } from './applications/file-upload.service';
import { FileRepository } from './repository/file.repository';
import { FileEntity, FileSchema } from './schema/files.schema';

@Module({
  imports: [
    ConfigModule,
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
  ],
  exports: [ImageStorageAdapter, FileUploadService],
})
export class FileUploadModule {}
