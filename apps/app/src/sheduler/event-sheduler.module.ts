import { Module } from '@nestjs/common';

import { RmqModule } from '../features/rmq-provider/rmq.module';
import { UserModule } from '../features/user/user.module';
import { BrokerModule } from '../features/broker/broker.module';

import { EventsSheduler } from './events-sheduler';
import { HandleEventForProfileAvatarHandler } from './command/handle-event-for-profile-avatar.command';
import { HandleEventForDeleteProfileAvatarHandler } from './command/handle-event-for-delete-profile-avatar.command';

const commands = [HandleEventForProfileAvatarHandler, HandleEventForDeleteProfileAvatarHandler];

@Module({
  imports: [RmqModule, UserModule, BrokerModule],
  providers: [EventsSheduler, ...commands],
})
export class EventShedulerModule {}
