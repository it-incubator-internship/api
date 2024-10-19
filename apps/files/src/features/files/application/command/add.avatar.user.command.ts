import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { ImageStorageAdapter } from '../../../../../../files/src/common/adapters/img/image.storage.adapter';
import {
  IMG_PROCESSING_ADAPTER,
  ImgProcessingAdapter,
} from '../../../../common/adapters/img/img-processing-adapter.interface';
import { FileUploadService } from '../file-upload.service';
import { FileRepository } from '../../repository/file.repository';
import { FileEntity, FileFormat, FileType } from '../../schema/files.schema';
import { maxAvatarSize } from '../../../../../../common/constants/constants';
import { EventRepository } from '../../repository/event.repository';
import { EventEntity, EventType } from '../../schema/events.schema';

type AddAvatarType = {
  eventId: string;
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
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: AddAvatarUserCommand) /* : Promise<ObjResult<void>> */ {
    try {
      await this.checkExistAvatar({ userId: command.inputModel.userId });

      const TEN_MB = maxAvatarSize; // 10 МБ;

      // Используем метод адаптера для конвертации изображения
      const originalWebpFilePath = await this.imgProcessingAdapter.convertToPng(
        command.inputModel.fileData /* .filePath */,
        TEN_MB,
      );

      // Используем метод адаптера для изменения размера изображения
      const smallWebpFilePath = await this.imgProcessingAdapter.resizeAvatar(command.inputModel.fileData);

      // Создаем потоки для сохранения изображений и сохраняем изображения на S3
      const [originalImageResult, smallImageResult] = await this.createFilesStreams({
        originalWebpFilePath,
        smallWebpFilePath,
      });

      // Если при создании потоков для сохранения изображений и сохранении изображений на S3 возникли ошибки
      if (!originalImageResult || !smallImageResult) {
        this.createEvent({
          success: false,
          smallUrl: null,
          originalUrl: null,
          eventId: command.inputModel.eventId,
        });

        return;
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
        userId: command.inputModel.userId,
        format: FileFormat.webp,
        type: FileType.avatar,
        url: {
          original: originalImageResult.url,
          small: smallImageResult.url,
        },
      });

      await this.fileRepository.create(newFileEntity);

      this.createEvent({
        success: true,
        smallUrl: smallImageResult.url,
        originalUrl: originalImageResult.url,
        eventId: command.inputModel.eventId,
      });

      return;
    } catch (error) {
      // Удаление локального файла в случае ошибки
      console.error('Error upload files:', error);
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

  private async createEvent({
    success,
    smallUrl,
    originalUrl,
    eventId,
  }: {
    success: boolean;
    smallUrl: string | null;
    originalUrl: string | null;
    eventId: string;
  }) {
    const eventEntity = EventEntity.createAvatarUploadEvent({
      success,
      type: EventType.uploadAvatar,
      smallUrl,
      originalUrl,
      eventId,
    });

    await this.eventRepository.create(eventEntity);
  }

  private async checkExistAvatar({ userId }: { userId: string }) {
    // поиск уже имеющейся аватарки
    const avatars = await this.fileRepository.findAvatar({ userId });

    avatars.forEach(async (a: FileEntity) => {
      a.delete();
      await this.fileRepository.updateAvatar(a);
    });
  }
}
