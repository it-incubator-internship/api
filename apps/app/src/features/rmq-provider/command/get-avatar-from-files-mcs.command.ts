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
    console.log('console.log in get.avatar.from.files.mcs.command (execute)');
    console.log('command in get.avatar.from.files.mcs.command (execute):', command);
    const { status, eventId, originalUrl, smallUrl } = command.data;
    console.log('status in get.avatar.from.files.mcs.command (execute):', status);
    console.log('eventId in get.avatar.from.files.mcs.command (execute):', eventId);
    console.log('originalUrl in get.avatar.from.files.mcs.command (execute):', originalUrl);
    console.log('smallUrl in get.avatar.from.files.mcs.command (execute):', smallUrl);

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
    console.log('data in get.avatar.from.files.mcs.command (execute):', data);
    await this.eventsService.updateEvent(data);
  }
}
