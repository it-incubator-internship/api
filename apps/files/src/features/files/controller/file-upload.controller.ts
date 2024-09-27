import { Controller, /* Inject, */ Param, ParseUUIDPipe, Post, Req, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

// import { FileUploadService } from '../applications/file-upload.service';
// import { ImageStorageAdapter } from '../../../common/adapters/img/image.storage.adapter';
// import {
//   IMG_PROCESSING_ADAPTER,
//   ImgProcessingAdapter,
// } from '../../../common/adapters/img/img-processing-adapter.interface';
import { FileUploadInterceptor } from '../interceptors/fileUpload.interceptor';
// import { FileEntity, FileFormat, FileType } from '../schema/files.schema';
// import { FileRepository } from '../repository/file.repository';
import { AddAvatarUserCommand } from '../application/command/add.avatar.user.command';

@Controller('upload')
export class FileUploadController {
  constructor(
    // private readonly fileUploadService: FileUploadService,
    // private readonly s3StorageAdapter: ImageStorageAdapter,
    // @Inject(IMG_PROCESSING_ADAPTER) // Инжектируем интерфейс адаптера
    // private readonly imgProcessingAdapter: ImgProcessingAdapter,
    // private readonly fileRepository: FileRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('avatar/:id')
  @UseInterceptors(FileUploadInterceptor)
  async uploadFile(@Param('id', ParseUUIDPipe) userId: string, @Req() fileData: any) {
    console.log('console.log in file upload controller (uploadFile)');
    const result = await this.commandBus.execute(new AddAvatarUserCommand({ userId, fileData }));
    console.log('result in file upload controller (uploadFile):', result);

    return result;

    // try {
    //   //TODO вынести в константы
    //   const TEN_MB = 10 * 1024 * 1024; // 10 МБ;

    //   // Используем метод адаптера для конвертации изображения
    //   const webpFilePath = await this.imgProcessingAdapter.convertToWebp(fileData.filePath, TEN_MB);

    //   // Создаем поток для сохранения изображения
    //   const fileStream = await this.fileUploadService.createFileStream(webpFilePath);

    //   // Сохранение изображения на S3
    //   const result = await this.s3StorageAdapter.saveImageFromStream(fileStream);

    //   // Удаление локального файла после загрузки
    //   await this.fileUploadService.deleteFile(fileData.filePath);
    //   await this.fileUploadService.deleteFile(webpFilePath);

    //   const newFileEntity = FileEntity.create({
    //     format: FileFormat.webp,
    //     type: FileType.avatar,
    //     url: {
    //       original: result.url,
    //     },
    //   });

    //   await this.fileRepository.create(newFileEntity);

    //   return result;
    // } catch (error) {
    //   // Удаление локального файла в случае ошибки
    //   await this.fileUploadService.deleteFile(fileData.filePath);
    //   throw error;
    // }
  }
}
