import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';

import { EventsService } from '../features/rmq-provider/events-db/events.service';
import { $Enums } from '../../prisma/client';

import { Data, HandleEventForProfileAvatarCommand } from './command/handle-event-for-profile-avatar.command';

import Entity = $Enums.Entity;

@Injectable()
export class EventsSheduler {
  constructor(
    private readonly eventsService: EventsService,
    private readonly commandBus: CommandBus,
  ) {}

  @Interval(10000) // Интервал в миллисекундах
  async handleInterval() {

    const events = await this.eventsService.getResolvedEvents();

    events.forEach((e) => {
      if (e.entity === Entity.PROFILE) {
        this.commandBus.execute(new HandleEventForProfileAvatarCommand(e as Data));
        this.eventsService.deleteEvent(e.id);
      }
    });
  }
}
