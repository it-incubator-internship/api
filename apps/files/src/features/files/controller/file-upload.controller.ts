import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FileUploadService } from '../applications/file-upload.service';
import { ImageStorageAdapter } from '../../../common/adapters/image.storage.adapter';
import { FileValidationPipe } from '../file-validation.pipe';
import { diskStorage } from '../../multer-config';

@Controller('upload')
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly s3StorageAdapter: ImageStorageAdapter,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage,
    }),
  )
  async uploadFile(@UploadedFile(FileValidationPipe) file: Express.Multer.File) {
    try {
      const fileStream = await this.fileUploadService.createFileStream(file.path);
      const result = await this.s3StorageAdapter.saveImageFromStream(fileStream);
      await this.fileUploadService.deleteFile(file.path);
      return result;
    } catch (error) {
      await this.fileUploadService.deleteFile(file.path);
      throw error;
    }
  }
}
