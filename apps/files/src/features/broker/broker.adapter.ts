import { ClientProxy } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';

import { RMQ_CMD } from '../../../../common/constants/enums';

type Event = {
  success: boolean;
  smallUrl: string;
  originalUrl: string;
  eventId: string;
};

@Injectable()
export class BrokerAdapter {
  constructor(@Inject('MULTICAST_EXCHANGE') private readonly gatewayProxyClient: ClientProxy) {}

  async sendAvatarEvent(event: Event) {
    this.gatewayProxyClient.emit({ cmd: RMQ_CMD.AVATAR_SAVED }, event);
  }
}
