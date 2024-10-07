import { Controller, Delete, Inject, Param, ParseUUIDPipe, Post, Req, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';

import { FileUploadInterceptor } from '../interceptors/fileUpload.interceptor';
import { AddAvatarUserCommand } from '../application/command/add.avatar.user.command';
import { DeleteAvatarUserCommand } from '../application/command/delete.avatar.user.command';
import { RMQ_CMD } from '../../../../../common/constants/enums';
import { DeleteAvatarUrlUserCommand } from '../application/command/delete.avatar.url.user.command';
import { ImageStorageAdapter } from '../../../../../files/src/common/adapters/img/image.storage.adapter';

const enum AvatarSavedStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export class AvatarSavedEvent {
  status: AvatarSavedStatus;
  eventId: string;
  originalUrl: string;
  smallUrl: string;
}

@Controller('upload')
export class FileUploadController {
  constructor(
    private commandBus: CommandBus,
    @Inject('MULTICAST_EXCHANGE') private readonly gatewayProxyClient: ClientProxy,
    private readonly s3StorageAdapter: ImageStorageAdapter,
  ) {}

  @Post('avatar/:id/:userId')
  @UseInterceptors(FileUploadInterceptor)
  async uploadFile(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ) {
    console.log('Controller executed');
    console.log('eventId in file-upload controller:', eventId);

    const filePath = req['filePath'];
    console.log('filePath in file-upload controller:', filePath);

    // Выполняем дополнительную логику в фоновом режиме
    setTimeout(() => this.processUploadedFile(eventId, filePath, userId), 5000);
  }

  private async processUploadedFile(eventId: string, filePath: string, userId: string) {
    try {
      const result = await this.commandBus.execute<NonNullable<unknown>, AvatarSavedEvent>(
        new AddAvatarUserCommand({ eventId, fileData: filePath, userId: userId }),
      );
      console.log('result in file controller v1 (uploadFile):', result);
      this.gatewayProxyClient.emit({ cmd: RMQ_CMD.AVATAR_SAVED }, result);
    } catch (error) {
      console.error('Error processing uploaded file:', error);
    }
  }

  @Delete('avatar/:id')
  async handleDelete(@Param('id', ParseUUIDPipe) userId: string) {
    console.log('console.log in file.upload.controller (handleDelete)');
    console.log('userId in file.upload.controller (handleDelete):', userId);

    const result = await this.commandBus.execute(new DeleteAvatarUrlUserCommand({ userId }));
    console.log('result in file.upload.controller (handleDelete):', result);

    if (!result.isSuccess) throw result.error;

    return;
  }

  // тестовый эндпоинт
  @Delete('avatar')
  async imgDelete() {
    console.log('console.log in file.upload.controller (imgDelete)');

    const result = await this.s3StorageAdapter.deleteAvatar({
      url: 'https://storage.yandexcloud.net/navaibe.1.0/content/images/524ccb0d-d674-47d5-9084-4b451d5b2157.webp',
    });
    console.log('result in file.upload.controller (handleDelete):', result);

    return;
  }
}
