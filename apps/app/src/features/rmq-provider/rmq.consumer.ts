import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AvatarSavedEvent } from '../../../../files/src/features/files/controller/file-upload.controller';

import { GetAvatarsFromFileMcsCommand } from './command/get-avatar-from-files-mcs.command';

@Controller('rmq')
export class RmqConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  //TODO вынести патерн
  @MessagePattern({ cmd: 'avatar-saved' })
  async getImgFromFiles(data: AvatarSavedEvent) {
    console.log(data);
    console.log('_____________________________________________________________________');
    console.log('_____________________________________________________________________');
    console.log('_____________________________________________________________________');
    console.log('_____________________________________________________________________');

    await this.commandBus.execute(new GetAvatarsFromFileMcsCommand(data));
  }
}
