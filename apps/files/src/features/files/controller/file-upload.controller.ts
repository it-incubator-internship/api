import { Controller, Param, ParseUUIDPipe, Post, UseInterceptors } from '@nestjs/common';

import { FileUploadService } from '../applications/file-upload.service';
import { ImageStorageAdapter } from '../../../common/adapters/image.storage.adapter';
import { FileUploadInterceptor } from '../interceptors/fileUpload.interceptor';

@Controller('upload')
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly s3StorageAdapter: ImageStorageAdapter,
  ) {}

  @Post('avatar/:id')
  @UseInterceptors(FileUploadInterceptor)
  async uploadFile(@Param('id', ParseUUIDPipe) userId: string, fileData: { filePath: string }) {
    try {
      const fileStream = await this.fileUploadService.createFileStream(fileData.filePath);
      const result = await this.s3StorageAdapter.saveImageFromStream(fileStream);
      await this.fileUploadService.deleteFile(fileData.filePath);
      return result;
    } catch (error) {
      await this.fileUploadService.deleteFile(fileData.filePath);
      throw error;
    }
  }
}
