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
  eventId: string;
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
    console.log('console.log in add.avatar.user.command');
    console.log('command in file-upload.controller:', command);

    try {
      const TEN_MB = maxAvatarSize; // 10 МБ;

      // Используем метод адаптера для конвертации изображения
      const originalWebpFilePath = await this.imgProcessingAdapter.convertToWebp(
        command.inputModel.fileData.filePath,
        TEN_MB,
      );

      // Используем метод адаптера для изменения размера изображения
      const smallWebpFilePath = await this.imgProcessingAdapter.resizeAvatar(command.inputModel.fileData.filePath);

      // Создаем потоки для сохранения изображений и сохраняем изображения на S3
      const [originalImageResult, smallImageResult] = await this.createFilesStreams({
        originalWebpFilePath,
        smallWebpFilePath,
      });

      // Если при создании потоков для сохранения изображений и сохранении изображений на S3 возникли ошибки
      if (!originalImageResult || !smallImageResult) {
        return {
          success: false,
          smallUrl: null,
          originalUrl: null,
          eventId: command.inputModel.eventId,
        };
      }

      // Удаление локального файла после загрузки
      try {
        await this.fileUploadService.deleteFile(command.inputModel.fileData.filePath);
        await this.fileUploadService.deleteFile(originalWebpFilePath);
        await this.fileUploadService.deleteFile(smallWebpFilePath);
      } catch (error) {
        console.error('Error deleting files:', error);
      }

      const newFileEntity = FileEntity.create({
        format: FileFormat.webp,
        type: FileType.avatar,
        url: {
          original: originalImageResult.url,
          small: smallImageResult.url,
        },
      });

      await this.fileRepository.create(newFileEntity);

      //TODO добавить тип
      return {
        success: true,
        smallUrl: originalImageResult.url,
        originalUrl: smallImageResult.url,
        eventId: command.inputModel.eventId,
      };
    } catch (error) {
      // Удаление локального файла в случае ошибки
      await this.fileUploadService.deleteFile(command.inputModel.fileData.filePath);
      throw error;
    }
  }

  private async createFilesStreams({ originalWebpFilePath, smallWebpFilePath }) {
    let attempts = 0;
    let originalImageResult: any;
    let smallImageResult: any;

    while (attempts < 3) {
      try {
        // Создание потоков для сохранения изображений
        const [originalFileStream, smallFileStream] = await Promise.all([
          this.fileUploadService.createFileStream(originalWebpFilePath),
          this.fileUploadService.createFileStream(smallWebpFilePath),
        ]);

        // Сохранение изображений на S3
        [originalImageResult, smallImageResult] = await Promise.all([
          this.s3StorageAdapter.saveImageFromStream(originalFileStream),
          this.s3StorageAdapter.saveImageFromStream(smallFileStream),
        ]);

        // если выполнение успешно, происходит выход из цикла
        break;
      } catch (error) {
        attempts++;
        console.error('Error creating file stream:', error);

        // если достигнуто максимальное количество попыток
        if (attempts >= 3) {
          return [null, null];
        }
      }
    }

    return [originalImageResult, smallImageResult];
  }
}
