import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionRepository } from '../repository/session.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';

export class DeletionSessionsCommand {
  constructor(public inputModel: { id: string }) {}
}

@CommandHandler(DeletionSessionsCommand)
export class DeletionSessionsHandler implements ICommandHandler<DeletionSessionsCommand> {
  constructor(private readonly sessionRepository: SessionRepository) {}
  async execute(command: DeletionSessionsCommand): Promise<any> {
    await this.sessionRepository.deleteAllSessions({ id: command.inputModel.id });

    return ObjResult.Ok();
  }
}
