import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AvatarSavedEvent } from '../../../../../files/src/features/files/controller/file-upload.controller';
import { EventsService } from '../events-db/events.service';
import { $Enums } from '../../../../prisma/client';

import EventStatus = $Enums.EventStatus;
import Entity = $Enums.Entity;

export class GetAvatarsFromFileMcsCommand {
  constructor(public data: AvatarSavedEvent) {}
}

@CommandHandler(GetAvatarsFromFileMcsCommand)
export class GetAvatarsFromFileMcsHandler implements ICommandHandler<GetAvatarsFromFileMcsCommand> {
  constructor(public eventsService: EventsService) {}

  async execute(command: GetAvatarsFromFileMcsCommand) {
    console.log(command.data);
    console.log('++++++++++++++++++++++++++++++');
    const { status, eventId, originalUrl, smallUrl } = command.data;

    const data = {
      eventId: eventId,
      entity: Entity.PROFILE,
      eventStatus: EventStatus.READY,
      data: {
        status,
        originalUrl,
        smallUrl,
      },
    };
    console.log(`data: ${JSON.stringify(data, null, 2)}`);
    await this.eventsService.updateEvent(data);
  }
}
