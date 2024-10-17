import { Module } from '@nestjs/common';

import { RmqModule } from '../features/rmq-provider/rmq.module';
import { UserModule } from '../features/user/user.module';

import { EventsSheduler } from './events-sheduler';
import { HandleEventForProfileAvatarHandler } from './command/handle-event-for-profile-avatar.command';

const commands = [HandleEventForProfileAvatarHandler];

@Module({
  imports: [RmqModule, UserModule],
  providers: [EventsSheduler, ...commands],
})
export class EventShedulerModule {}
