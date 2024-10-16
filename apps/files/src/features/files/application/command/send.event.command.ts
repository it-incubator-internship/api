import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

import { ObjResult } from '../../../../../../common/utils/result/object-result';
// import { FileRepository } from '../../repository/file.repository';
import { RMQ_CMD } from '../../../../../../common/constants/enums';
import { EventRepository } from '../../repository/event.repository';
import { EventType } from '../../schema/files-upload-result.schema';

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
    // private readonly fileRepository: FileRepository,
    private readonly eventRepository: EventRepository,
    @Inject('MULTICAST_EXCHANGE') private readonly gatewayProxyClient: ClientProxy,
  ) {}

  async execute(command: any): Promise<ObjResult<void>> {
    console.log('console.log in send.event.command');
    console.log('command in send.event.command:', command);

    const result = {
      success: command.inputModel.success,
      smallUrl: command.inputModel.payload.smallUrl,
      originalUrl: command.inputModel.payload.originalUrl,
      eventId: command.inputModel.eventId,
    };
    console.log('result in send.event.command:', result);

    this.gatewayProxyClient.emit({ cmd: RMQ_CMD.AVATAR_SAVED }, result);

    await this.eventRepository.deleteEvent({ id: command.inputModel.id });

    return ObjResult.Ok();
  }
}
