import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImageStorageAdapter } from './common/adapters/image.storage.adapter';
import { FileUploadService } from './common/adapters/file-upload.service';
import { diskStorage } from './common/adapters/multer-options';

@Controller('files')
export class FilesController {
  constructor(
    private readonly imageStorageAdapter: ImageStorageAdapter,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage,
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{ name: string }> {
    if (!file || !file.path) {
      throw new BadRequestException('Файл не загружен или путь не найден');
    }

    try {
      const fileExists: boolean = await this.fileUploadService.fileExists(file.path);
      if (!fileExists) {
        throw new BadRequestException('Файл не найден');
      }

      const fileStream = this.fileUploadService.createFileStream(file.path);
      const result = await this.imageStorageAdapter.saveImageFromStream(fileStream);

      // Удаляем временный файл после успешной загрузки
      await this.fileUploadService.deleteFile(file.path);

      return result;
    } catch (error) {
      if (file && file.path) {
        await this.fileUploadService.deleteFile(file.path); // Удаляем файл в случае ошибки
      }
      throw new BadRequestException('Ошибка при загрузке файла');
    }
  }
}
