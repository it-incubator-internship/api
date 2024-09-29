import { Controller, Inject, Param, ParseUUIDPipe, Post, Req, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';

import { FileUploadInterceptor } from '../interceptors/fileUpload.interceptor';
import { AddAvatarUserCommand } from '../application/command/add.avatar.user.command';

const enum AvatarSavedStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export class AvatarSavedEvent {
  status: AvatarSavedStatus;
  profileId: string;
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
  async uploadFile(@Param('id', ParseUUIDPipe) userId: string, @Req() fileData: any) {
    const result = await this.commandBus.execute<{}, AvatarSavedEvent>(new AddAvatarUserCommand({ userId, fileData }));

    this.gatewayProxyClient.emit({ cmd: 'avatar-saved' }, result);

    return result;
  }
}
