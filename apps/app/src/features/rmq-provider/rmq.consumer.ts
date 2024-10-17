import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AvatarSavedEvent } from '../../../../files/src/features/files/controller/file-upload.controller';
import { RMQ_CMD } from '../../../../common/constants/enums';

import { GetAvatarsFromFileMcsCommand } from './command/get-avatar-from-files-mcs.command';

@Controller('rmq')
export class RmqConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern({ cmd: RMQ_CMD.AVATAR_SAVED })
  async getImgFromFiles(data: AvatarSavedEvent) {
    await this.commandBus.execute(new GetAvatarsFromFileMcsCommand(data));
  }
}
