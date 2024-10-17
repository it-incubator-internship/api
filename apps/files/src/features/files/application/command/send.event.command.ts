import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { EventRepository } from '../../repository/event.repository';
import { EventType } from '../../schema/events.schema';
import { BrokerAdapter } from '../../../broker/broker.adapter';

export type EventsType = {
  id: string;
  success: boolean;
  type: EventType;
  payload: {
    smallUrl: string | null;
    originalUrl: string | null;
  };
  eventId: string;
};

export class SendEventCommand {
  constructor(public inputModel: EventsType) {}
}

@CommandHandler(SendEventCommand)
export class SendEventHandler implements ICommandHandler<SendEventCommand> {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly brokerAdapter: BrokerAdapter,
  ) {}

  async execute(command: any): Promise<ObjResult<void>> {
    const event = {
      success: command.inputModel.success,
      smallUrl: command.inputModel.payload.smallUrl,
      originalUrl: command.inputModel.payload.originalUrl,
      eventId: command.inputModel.eventId,
    };

    await this.brokerAdapter.sendAvatarEvent(event);

    await this.eventRepository.deleteEvent({ id: command.inputModel.id });

    return ObjResult.Ok();
  }
}
