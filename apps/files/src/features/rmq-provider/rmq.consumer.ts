import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { RMQ_CMD } from '../../../../common/constants/enums';
import { DeleteAvatarUrlUserCommand } from '../files/application/command/delete.avatar.url.user.command';

@Controller('rmq')
export class RmqConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern({ cmd: RMQ_CMD.AVATAR_DELETED })
  async handleDelete(userId: string) {
    const result = await this.commandBus.execute(new DeleteAvatarUrlUserCommand({ userId }));

    if (!result.isSuccess) throw result.error;

    return;
  }
}
