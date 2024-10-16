import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

import { ObjResult } from '../../../../../../common/utils/result/object-result';
// import { FileRepository } from '../../repository/file.repository';
import { RMQ_CMD } from '../../../../../../common/constants/enums';
import { FileUploadRepository } from '../../repository/file-upload-result.repository';
import { EventType } from '../../schema/files-upload-result.schema';

export type UploadResultType = {
  id: string;
  success: boolean;
  type: EventType;
  payload: {
    smallUrl: string | null;
    originalUrl: string | null;
  };
  eventId: string;
};

export class SendUploadResultCommand {
  constructor(public inputModel: UploadResultType) {}
}

@CommandHandler(SendUploadResultCommand)
export class SendUploadResultHandler implements ICommandHandler<SendUploadResultCommand> {
  constructor(
    // private readonly fileRepository: FileRepository,
    private readonly fileUploadRepository: FileUploadRepository,
    @Inject('MULTICAST_EXCHANGE') private readonly gatewayProxyClient: ClientProxy,
  ) {}

  async execute(command: any): Promise<ObjResult<void>> {
    const result = {
      success: command.inputModel.success,
      smallUrl: command.inputModel.smallUrl,
      originalUrl: command.inputModel.originalUrl,
      eventId: command.inputModel.eventId,
    };

    this.gatewayProxyClient.emit({ cmd: RMQ_CMD.AVATAR_SAVED }, result);

    await this.fileUploadRepository.deleteUploadResult({ id: command.inputModel.id });

    return ObjResult.Ok();
  }
}
