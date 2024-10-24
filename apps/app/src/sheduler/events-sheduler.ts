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

// оставляю как пример стараго варианта
// @Injectable()
// export class EventsSheduler {
//   constructor(
//     private readonly eventsService: EventsService,
//     private readonly commandBus: CommandBus,
//   ) {}

//   @Interval(10000) // Интервал в миллисекундах
//   async handleInterval() {
//     const events = await this.eventsService.getResolvedEvents();

//     events.forEach((e) => {
//       // если event касается загрузки аватарки
//       if (e.entity === Entity.PROFILE && e.eventType === EventType.CREATE) {
//         this.commandBus.execute(new HandleEventForProfileAvatarCommand(e as Data));
//         this.eventsService.deleteEvent(e.id);
//       }
//       // если event касается удаления аватарки
//       if (e.entity === Entity.PROFILE && e.eventType === EventType.DELETE) {
//         try {
//           this.commandBus.execute(new HandleEventForDeleteProfileAvatarCommand(e as DataForDelete));
//         } catch {
//           // TODO logger
//           console.error('error in event sheduler');
//         }
//       }
//     });
//   }
// }

@Injectable()
export class EventsSheduler {
  constructor(
    private readonly eventsService: EventsService,
    private readonly commandBus: CommandBus,
  ) {}

  private readonly methodSelector = {
    [Entity.PROFILE]: {
      [EventType.CREATE]: (event: Data) =>
        this.commandBus.execute(new HandleEventForProfileAvatarCommand(event as Data)),
      [EventType.DELETE]: (event: DataForDelete) =>
        this.commandBus.execute(new HandleEventForDeleteProfileAvatarCommand(event as DataForDelete)),
    },
    // оставляю для следующих задач
    // [Entity.GALLERY]: {
    //   [EventType.CREATE]: (event: Data) => this.commandBus.execute(new HandleEventForGalleryCreateCommand(event)),
    //   [EventType.DELETE]: (event: DataForDelete) => this.commandBus.execute(new HandleEventForGalleryDeleteCommand(event)),
    // }
  };

  @Interval(10000) // Интервал в миллисекундах
  async handleInterval() {
    const events = await this.eventsService.getResolvedEvents();

    events.forEach((e) => {
      const method = this.methodSelector[e.entity]?.[e.eventType];

      if (method) {
        try {
          method(e);
          if (e.eventType === EventType.CREATE) {
            this.eventsService.deleteEvent(e.id);
          }
        } catch (error) {
          // TODO: logger
          console.error('Error in event scheduler');
        }
      } else {
        // TODO: logger
        console.error(`No method found for entity: ${e.entity}, eventType: ${e.eventType}`);
      }
    });
  }
}
