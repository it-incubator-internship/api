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
    console.log('console.log in delete avatar url user command');
    console.log('command in delete avatar url user command:', command);

    // поиск avatar
    const avatar = await this.fileRepository.findAvatar({ userId: command.inputModel.userId });
    console.log('avatar in delete avatar url user command:', avatar);

    // что правильнне вернуть при !avatar???
    // если avatar не найден
    if (!avatar) {
      console.log('!avatar in delete avatar url user command');
      return ObjResult.Err(new NotFoundError('avatar not found'));
    }

    avatar.delete();
    console.log('avatar in delete avatar url user command:', avatar);

    const updatingResult = await this.fileRepository.updateAvatar(avatar);
    console.log('updatingResult in delete avatar url user command:', updatingResult);

    return ObjResult.Ok();
  }
}
