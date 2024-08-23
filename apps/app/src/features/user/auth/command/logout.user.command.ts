import { UserRepository } from '../../user/repository/user.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionRepository } from '../repository/session.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';

export class LogoutUserCommand {
  constructor(public inputModel: { userId: string; deviceUuid: string }) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserHandler implements ICommandHandler<LogoutUserCommand> {
  constructor(private readonly sessionRepository: SessionRepository) {}
  async execute(command: LogoutUserCommand): Promise<any> {
    await this.sessionRepository.deleteSessionByDeviceUuid({ deviceUuid: command.inputModel.deviceUuid });
    return ObjResult.Ok();
  }
}
