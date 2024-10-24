import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../features/user/user/repository/user.repository';
import { EventsService } from '../../features/rmq-provider/events-db/events.service';
import { $Enums } from '../../../prisma/client';
import { BrokerAdapter } from '../../features/broker/broker.adapter';

import Entity = $Enums.Entity;
import EventType = $Enums.EventType;
import EventStatus = $Enums.EventStatus;

export type DataForDelete = {
  id: string;
  parentId: string;
  entity: Entity;
  eventStatus: EventStatus;
  eventType: EventType;
  proccesingDate: Date;
  data: null;
};

export class HandleEventForDeleteProfileAvatarCommand {
  constructor(public data: DataForDelete) {}
}

@CommandHandler(HandleEventForDeleteProfileAvatarCommand)
export class HandleEventForDeleteProfileAvatarHandler
  implements ICommandHandler<HandleEventForDeleteProfileAvatarCommand>
{
  constructor(
    private readonly eventsService: EventsService,
    public userRepository: UserRepository,
    private readonly brokerAdapter: BrokerAdapter,
  ) {}

  async execute(command: HandleEventForDeleteProfileAvatarCommand) {
    const { id, parentId, entity, eventStatus, eventType, proccesingDate , data } = command.data;

    if (entity !== Entity.PROFILE && eventType !== EventType.DELETE) throw new Error('wrong entity in event');

    await this.brokerAdapter.sendDeleteAvatarEvent({ parentId });

    this.eventsService.deleteEvent(id);
  }
}
