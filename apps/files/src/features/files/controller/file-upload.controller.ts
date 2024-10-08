import { Controller, Inject, Param, ParseUUIDPipe, Post, Req, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';

import { FileUploadInterceptor } from '../interceptors/fileUpload.interceptor';
import { AddAvatarUserCommand } from '../application/command/add.avatar.user.command';
import { RMQ_CMD } from '../../../../../common/constants/enums';
import { DeleteAvatarUrlUserCommand } from '../application/command/delete.avatar.url.user.command';

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
  ) {}

  @Post('avatar/:id/:userId')
  @UseInterceptors(FileUploadInterceptor)
  async uploadFile(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ) {
    const filePath = req['filePath'];

    // Выполняем дополнительную логику в фоновом режиме
    setTimeout(() => this.processUploadedFile(eventId, filePath, userId), 5000);
  }

  private async processUploadedFile(eventId: string, filePath: string, userId: string) {
    try {
      const result = await this.commandBus.execute<NonNullable<unknown>, AvatarSavedEvent>(
        new AddAvatarUserCommand({ eventId, fileData: filePath, userId: userId }),
      );
      this.gatewayProxyClient.emit({ cmd: RMQ_CMD.AVATAR_SAVED }, result);
    } catch (error) {
      console.error('Error processing uploaded file:', error);
    }
  }

  @MessagePattern({ cmd: RMQ_CMD.AVATAR_DELETED })
  async handleDelete(userId: string) {
    const result = await this.commandBus.execute(new DeleteAvatarUrlUserCommand({ userId }));

    if (!result.isSuccess) throw result.error;

    return;
  }
}
