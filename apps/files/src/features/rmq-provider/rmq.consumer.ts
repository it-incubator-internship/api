import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
// import { CommandBus } from '@nestjs/cqrs';

// import { AvatarSavedEvent } from '../../../../files/src/features/files/controller/file-upload.controller';

@Controller('xxx')
export class RmqConsumerX {
  constructor(/* private readonly commandBus: CommandBus */) {}

  //TODO вынести патерн
  @MessagePattern({ cmd: 'avatar-deleted' })
  async deleteAvatar(/* data: AvatarSavedEvent */) {
    // await this.commandBus.execute(new GetAvatarsFromFileMcsCommand(data));
    console.log('console.log in rmq.consumer (avatar-deleted)');
  }
}
