import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionRepository } from '../../../repository/session.repository';
import { ObjResult } from '../../../../../../../../common/utils/result/object-result';
import { EntityEnum } from '../../../../../../../../common/repository/base.repository';
import { ForbiddenError } from '../../../../../../../../common/utils/result/custom-error';

export enum TerminateType {
  current,
  other,
}

export class TerminateSessionByIdCommand {
  constructor(public data: { commandType: TerminateType; deviceUuid: string; userId: string }) {}
}

@CommandHandler(TerminateSessionByIdCommand)
export class TerminateSessionByIdHandler implements ICommandHandler<TerminateSessionByIdCommand> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(command: TerminateSessionByIdCommand) {
    const { deviceUuid, commandType, userId } = command.data;

    const isHavePermission = await this.checkPermission(deviceUuid, userId);

    if (!isHavePermission) {
      return ObjResult.Err(new ForbiddenError(`user doesn't have permission`));
    }

    switch (commandType) {
      case TerminateType.current:
        await this.terminateCurrentSession(deviceUuid);
        break;
      case TerminateType.other:
        await this.terminateOtherSession(deviceUuid, userId);
        break;
    }

    return ObjResult.Ok();
  }

  private async checkPermission(deviceUuid: string, userId: string) {
    const session = await this.sessionRepository.findFirstOne({
      modelName: EntityEnum.session,
      conditions: { deviceUuid },
    });

    return session?.profileId === userId;
  }

  private async terminateCurrentSession(deviceUuid: string) {
    await this.sessionRepository.deleteSessionByDeviceUuid({ deviceUuid });
  }

  private async terminateOtherSession(deviceUuid: string, userId: string) {
    await this.sessionRepository.deleteOtherSessions({ deviceUuid, profileId: userId });
  }
}
