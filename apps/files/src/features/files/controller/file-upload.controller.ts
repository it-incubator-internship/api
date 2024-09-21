import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FileUploadService } from '../applications/file-upload.service';
import { ImageStorageAdapter } from '../../../common/adapters/image.storage.adapter';
import { FileValidationPipe } from '../file-validation.pipe';

@Controller('upload')
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly imageStorageAdapter: ImageStorageAdapter,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile(FileValidationPipe) file: Express.Multer.File) {
    const fileStream = await this.fileUploadService.createFileStream(file.path);
    const result = await this.imageStorageAdapter.saveImageFromStream(fileStream);
    await this.fileUploadService.deleteFile(file.path);
    return result;
  }
}
