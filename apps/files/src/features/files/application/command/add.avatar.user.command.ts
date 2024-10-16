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
// import { FileUploadResultEntity } from '../../schema/files-upload-result.schema';
import { EventRepository } from '../../repository/event.repository';
import { EventEntity, EventType } from '../../schema/files-upload-result.schema';

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
    console.log('console.log in add.avatar.user.command (execute)');
    console.log('command in add.avatar.user.command (execute):', command);

    try {
      // поиск уже имеющейся аватарки
      /* const avatars = await this.fileRepository.findAvatar({ userId: command.inputModel.userId });
      console.log('avatars in add avatar user command:', avatars); */

      // если аватарка уже есть
      // if (avatar) {
      //   avatar.delete();

      //   await this.fileRepository.updateAvatar(avatar);
      // }
      /* avatars.forEach(async (a) => {
        a.delete();
        await this.fileRepository.updateAvatar(a);
      }); */

      await this.checkExistAvatar({ userId: command.inputModel.userId });

      const TEN_MB = maxAvatarSize; // 10 МБ;
      console.log('TEN_MB in add avatar user command (execute):', TEN_MB);

      // Используем метод адаптера для конвертации изображения
      const originalWebpFilePath = await this.imgProcessingAdapter.convertToPng(
        command.inputModel.fileData /* .filePath */,
        TEN_MB,
      );
      console.log('originalWebpFilePath in add avatar user command (execute):', originalWebpFilePath);

      // Используем метод адаптера для изменения размера изображения
      const smallWebpFilePath = await this.imgProcessingAdapter.resizeAvatar(command.inputModel.fileData);
      console.log('smallWebpFilePath in add avatar user command (execute):', smallWebpFilePath);

      // Создаем потоки для сохранения изображений и сохраняем изображения на S3
      const [originalImageResult, smallImageResult] = await this.createFilesStreams({
        originalWebpFilePath,
        smallWebpFilePath,
      });
      console.log('originalImageResult in add avatar user command (execute):', originalImageResult);
      console.log('smallImageResult in add avatar user command (execute):', smallImageResult);

      // Если при создании потоков для сохранения изображений и сохранении изображений на S3 возникли ошибки
      if (!originalImageResult || !smallImageResult) {
        console.log('!originalImageResult || !smallImageResult in add avatar user command (execute)');
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
      console.log('newFileEntity in add avatar user command (execute):', newFileEntity);

      const result = await this.fileRepository.create(newFileEntity);
      console.log('result in add avatar user command (execute):', result);

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
    console.log('console.log in add avatar user command (createFilesStreams)');
    console.log('originalWebpFilePath in add avatar user command (createFilesStreams):', originalWebpFilePath);
    console.log('smallWebpFilePath in add avatar user command (createFilesStreams):', smallWebpFilePath);

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
        console.log('originalImageResult in add avatar user command (createFilesStreams):', originalImageResult);
        console.log('smallImageResult in add avatar user command (createFilesStreams):', smallImageResult);

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
    console.log('console.log in add avatar user command (createEvent)');
    console.log('success in add avatar user command (createEvent):', success);
    console.log('smallUrl in add avatar user command (createEvent):', smallUrl);
    console.log('originalUrl in add avatar user command (createEvent):', originalUrl);
    console.log('eventId in add avatar user command (createEvent):', eventId);

    const eventEntity = EventEntity.create({
      success,
      type: EventType.uploadAvatar,
      smallUrl,
      originalUrl,
      eventId,
    });
    console.log('eventEntity in add avatar user command (createEvent):', eventEntity);

    const result = await this.eventRepository.create(eventEntity);
    console.log('result in add avatar user command (createEvent):', result);
  }

  private async checkExistAvatar({ userId }: { userId: string }) {
    console.log('console.log in add.avatar.user.command (checkExistAvatar)');
    console.log('userId in add.avatar.user.command (checkExistAvatar):', userId);

    // поиск уже имеющейся аватарки
    const avatars = await this.fileRepository.findAvatar({ userId });
    console.log('avatars in add avatar user command (checkExistAvatar):', avatars);

    // если аватарка уже есть
    // if (avatar) {
    //   avatar.delete();

    //   await this.fileRepository.updateAvatar(avatar);
    // }
    avatars.forEach(async (a: FileEntity) => {
      a.delete();
      await this.fileRepository.updateAvatar(a);
    });
  }
}
