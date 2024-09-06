import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

// import { SessionRepository } from '../../repository/session.repository';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { SessionRepo } from '../../repository/session.repo';

export class DeletionSessionsCommand {
  constructor(public inputModel: { id: string }) {}
}

@CommandHandler(DeletionSessionsCommand)
export class DeletionSessionsHandler implements ICommandHandler<DeletionSessionsCommand> {
  constructor(
    // private readonly sessionRepository: SessionRepository
    private readonly sessionRepo: SessionRepo,
  ) {}
  async execute(command: DeletionSessionsCommand): Promise<any> {
    // await this.sessionRepository.deleteAllSessionsByProfileId({ id: command.inputModel.id });
    await this.sessionRepo.deleteAllSessionsByProfileId({ id: command.inputModel.id });

    return ObjResult.Ok();
  }
}
