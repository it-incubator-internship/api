import { Controller, Param, ParseUUIDPipe, Post, Req, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { FileUploadInterceptor } from '../interceptors/fileUpload.interceptor';
import { AddAvatarUserCommand } from '../application/command/add.avatar.user.command';

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
  constructor(private commandBus: CommandBus) {}

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
      await this.commandBus.execute<NonNullable<unknown>, AvatarSavedEvent>(
        new AddAvatarUserCommand({ eventId, fileData: filePath, userId: userId }),
      );
    } catch (error) {
      console.error('Error processing uploaded file:', error);
    }
  }
}
