import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Interval } from '@nestjs/schedule';

// import { FileRepository } from '../features/files/repository/file.repository';
import { avatarShedulerInterval } from '../common/constants/constants';
import { SendEventCommand } from '../features/files/application/command/send.event.command';
import { EventRepository } from '../features/files/repository/event.repository';

@Injectable()
export class EventSheduler {
  constructor(
    // private readonly fileRepository: FileRepository,
    private readonly eventRepository: EventRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Interval(avatarShedulerInterval) // Интервал в миллисекундах
  async handleInterval() {
    const events = await this.eventRepository.findEvents();
    console.log('events in event.sheduler:', events);

    events.forEach((e) => {
      try {
        this.commandBus.execute(new SendEventCommand(e));
      } catch {
        // TODO logger
        console.error('error in event sheduler');
      }
    });
  }
}
