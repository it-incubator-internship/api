import { ClientProxy } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';

import { RMQ_CMD } from '../../../../common/constants/enums';

@Injectable()
export class BrokerAdapter {
  constructor(@Inject('MULTICAST_EXCHANGE') private readonly gatewayProxyClient: ClientProxy) {}

  // в этом методе parentId === userId
  async sendDeleteAvatarEvent({ parentId }: { parentId: string }) {
    this.gatewayProxyClient.emit({ cmd: RMQ_CMD.AVATAR_DELETED }, parentId);
  }
}
