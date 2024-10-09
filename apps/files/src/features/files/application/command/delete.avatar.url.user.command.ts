import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { FileRepository } from '../../repository/file.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { NotFoundError } from '../../../../../../common/utils/result/custom-error';

export class DeleteAvatarUrlUserCommand {
  constructor(public inputModel: { userId: string }) {}
}

@CommandHandler(DeleteAvatarUrlUserCommand)
export class DeleteAvatarUrlUserHandler implements ICommandHandler<DeleteAvatarUrlUserCommand> {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(command: DeleteAvatarUrlUserCommand): Promise<ObjResult<void>> {

    // поиск avatar
    const avatar = await this.fileRepository.findAvatar({ userId: command.inputModel.userId });

    // если avatar не найден
    if (!avatar) {
      return ObjResult.Err(new NotFoundError('avatar not found'));
    }

    avatar.delete();

    await this.fileRepository.updateAvatar(avatar);

    return ObjResult.Ok();
  }
}
