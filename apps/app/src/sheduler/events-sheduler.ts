import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';

import { EventsService } from '../features/rmq-provider/events-db/events.service';
import { $Enums } from '../../prisma/client';

import { Data, HandleEventForProfileAvatarCommand } from './command/handle-event-for-profile-avatar.command';
import {
  DataForDelete,
  HandleEventForDeleteProfileAvatarCommand,
} from './command/handle-event-for-delete-profile-avatar.command';

import Entity = $Enums.Entity;
import EventType = $Enums.EventType;

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
      // если event касается загрузки аватарки
      if (e.entity === Entity.PROFILE && e.eventType === EventType.CREATE) {
        this.commandBus.execute(new HandleEventForProfileAvatarCommand(e as Data));
        this.eventsService.deleteEvent(e.id);
      }
      // если event касается удаления аватарки
      if (e.entity === Entity.PROFILE && e.eventType === EventType.DELETE) {
        try {
          this.commandBus.execute(new HandleEventForDeleteProfileAvatarCommand(e as DataForDelete));
        } catch {
          // TODO logger
          console.error('error in event sheduler');
        }
      }
    });
  }
}
