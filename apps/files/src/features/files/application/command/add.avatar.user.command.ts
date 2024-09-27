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
  constructor(public inputModel: /* { userId: string; fileData: any } */ AddAvatarType) /* DeleteAvatarType */ {}
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
    console.log('command in add avatar user command:', command);

    try {
      console.log('console.log(try) in add avatar user command');
      //TODO вынести в константы
      const TEN_MB = /* 10 * 1024 * 1024 */ maxAvatarSize; // 10 МБ;
      console.log('TEN_MB in add avatar user command:', TEN_MB);

      // Используем метод адаптера для конвертации изображения
      const webpFilePath = await this.imgProcessingAdapter.convertToWebp(command.inputModel.fileData.filePath, TEN_MB);
      console.log('webpFilePath in add avatar user command:', webpFilePath);

      // Создаем поток для сохранения изображения
      const fileStream = await this.fileUploadService.createFileStream(webpFilePath);
      // console.log('fileStream in add avatar user command:', fileStream);

      // Сохранение изображения на S3
      const result = await this.s3StorageAdapter.saveImageFromStream(fileStream);
      console.log('result in add avatar user command:', result);

      // Удаление локального файла после загрузки
      // await this.fileUploadService.deleteFile(command.inputModel.fileData.filePath);
      // await this.fileUploadService.deleteFile(webpFilePath);

      const newFileEntity = FileEntity.create({
        format: FileFormat.webp,
        type: FileType.avatar,
        url: {
          original: result.url,
        },
      });
      console.log('newFileEntity in add avatar user command:', newFileEntity);

      await this.fileRepository.create(newFileEntity);

      return result;
    } catch (error) {
      console.log('console.log(catch) in add avatar user command');
      // Удаление локального файла в случае ошибки
      await this.fileUploadService.deleteFile(command.inputModel.fileData.filePath);
      throw error;
    }
  }
}
