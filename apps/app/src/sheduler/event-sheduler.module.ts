import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CqrsModule } from '@nestjs/cqrs';

import { RmqModule } from '../features/rmq-provider/rmq.module';

import { EventsSheduler } from './events-sheduler';
import { HandleEventForProfileAvatarCommand } from './command/handle-event-for-profile-avatar.command';

const commands = [HandleEventForProfileAvatarCommand];

@Module({
  imports: [ScheduleModule.forRoot(), CqrsModule.forRoot(), RmqModule],
  providers: [EventsSheduler, ...commands],
})
export class EventShedulerModule {}
