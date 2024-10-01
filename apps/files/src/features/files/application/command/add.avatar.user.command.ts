import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { ImageStorageAdapter } from '../../../../../../files/src/common/adapters/img/image.storage.adapter';
import {
  IMG_PROCESSING_ADAPTER,
  ImgProcessingAdapter,
} from '../../../../common/adapters/img/img-processing-adapter.interface';
import { FileUploadService } from '../../applications/file-upload.service';
import { FileRepository } from '../../repository/file.repository';
import { FileEntity, FileFormat, FileType } from '../../schema/files.schema';
import { maxAvatarSize } from '../../../../../../common/constants/constants';

type AddAvatarType = {
  userId: string;
  fileData: any;
};

export class AddAvatarUserCommand {
  constructor(public inputModel: AddAvatarType) {}
}

@CommandHandler(AddAvatarUserCommand)
export class AddAvatarUserHandler implements ICommandHandler<AddAvatarUserCommand> {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly s3StorageAdapter: ImageStorageAdapter,
    @Inject(IMG_PROCESSING_ADAPTER) // Инжектируем интерфейс адаптера
    private readonly imgProcessingAdapter: ImgProcessingAdapter,
    private readonly fileRepository: FileRepository,
  ) {}

  async execute(command: AddAvatarUserCommand) /* : Promise<ObjResult<void>> */ {
    try {
      const TEN_MB = maxAvatarSize; // 10 МБ;

      // Используем метод адаптера для конвертации изображения
      const originalWebpFilePath = await this.imgProcessingAdapter.convertToWebp(
        command.inputModel.fileData.filePath,
        TEN_MB,
      );

      // Используем метод адаптера для изменения размера изображения
      const smallWebpFilePath = await this.imgProcessingAdapter.resizeAvatar(originalWebpFilePath);

      // первоначальный вариант, сейсас он в Promise.all
      // Создаем поток для сохранения изображения
      // const fileStream = await this.fileUploadService.createFileStream(originalWebpFilePath);
      // console.log('fileStream in add avatar user command:', fileStream);

      // Создаем потоки для сохранения изображений
      const [originalFileStream, smallFileStream] = await Promise.all([
        this.fileUploadService.createFileStream(originalWebpFilePath),
        this.fileUploadService.createFileStream(smallWebpFilePath),
      ]);

      // Сохранение изображений на S3
      const originalImageResult = await this.s3StorageAdapter.saveImageFromStream(originalFileStream);
      const smallImageResult = await this.s3StorageAdapter.saveImageFromStream(smallFileStream);

      //TODO пока что картинка одного размера
      const newFileEntity = FileEntity.create({
        format: FileFormat.webp,
        type: FileType.avatar,
        url: {
          original: originalImageResult.url,
          small: smallImageResult.url,
        },
      });

      await this.fileRepository.create(newFileEntity);

      // // Удаление локального файла после загрузки
      // await this.fileUploadService.deleteFile(command.inputModel.fileData.filePath);
      // await this.fileUploadService.deleteFile(originalWebpFilePath);
      // await this.fileUploadService.deleteFile(smallWebpFilePath);

      //TODO добавить тип
      return {
        success: true,
        smallUrl: originalImageResult.url,
        originalUrl: smallImageResult.url,
        profileId: command.inputModel.userId,
      };
    } catch (error) {
      // Удаление локального файла в случае ошибки
      await this.fileUploadService.deleteFile(command.inputModel.fileData.filePath);
      throw error;
    }
  }
}
