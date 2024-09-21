import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FileUploadService } from '../common/adapters/file-upload.service';
import { ImageStorageAdapter } from '../common/adapters/image.storage.adapter';

import { FileUploadController } from './files/controller/file-upload.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FileUploadController],
  providers: [FileUploadService, ImageStorageAdapter],
})
export class FileUploadModule {}
