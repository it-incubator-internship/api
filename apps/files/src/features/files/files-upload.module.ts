import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ImageStorageAdapter } from '../../common/adapters/image.storage.adapter';

import { FileUploadController } from './controller/file-upload.controller';
import { FileUploadService } from './applications/file-upload.service';

@Module({
  imports: [ConfigModule],
  controllers: [FileUploadController],
  providers: [FileUploadService, ImageStorageAdapter],
  exports: [ImageStorageAdapter, FileUploadService],
})
export class FileUploadModule {}
