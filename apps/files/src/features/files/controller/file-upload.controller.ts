import { Controller, Delete, Inject, Param, ParseUUIDPipe, Post, Req, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';

import { FileUploadInterceptor } from '../interceptors/fileUpload.interceptor';
import { AddAvatarUserCommand } from '../application/command/add.avatar.user.command';
import { DeleteAvatarUserCommand } from '../application/command/delete.avatar.user.command';

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

  @Post('avatar/:id')
  @UseInterceptors(FileUploadInterceptor)
  async uploadFile(@Param('id', ParseUUIDPipe) eventId: string, @Req() req) {
    console.log('Controller executed');
    console.log('eventId in file-upload controller:', eventId);

    const filePath = req['filePath'];
    console.log('filePath in file-upload controller:', filePath);

    // Выполняем дополнительную логику в фоновом режиме
    setTimeout(() => this.processUploadedFile(eventId, filePath), 5000);
  }

  private async processUploadedFile(eventId: string, filePath: string) {
    try {
      const result = await this.commandBus.execute<{}, AvatarSavedEvent>(
        new AddAvatarUserCommand({ eventId, fileData: filePath }),
      );
      console.log('result in file controller v1 (uploadFile):', result);
      this.gatewayProxyClient.emit({ cmd: 'avatar-saved' }, result);
    } catch (error) {
      console.error('Error processing uploaded file:', error);
    }
  }

  @Delete('avatar/:id')
  async handleDelete(@Param('id', ParseUUIDPipe) userId: string /* , @Req() req: Request, @Res() res: Response */) {
    console.log('userId in file.upload.controller (handleDelete):', userId);

    const result = await this.commandBus.execute(new DeleteAvatarUserCommand({ userId }));
    console.log('result in file.upload.controller (handleDelete):', result);

    return /* blog */;
  }
}
