import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { FileRepository } from '../../repository/file.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { NotFoundError } from '../../../../../../common/utils/result/custom-error';

// type DeleteAvatarType = {
//   userId: string;
// };

export class DeleteAvatarUserCommand {
  constructor(public inputModel: { userId: string }) {}
}

@CommandHandler(DeleteAvatarUserCommand)
export class DeleteAvatarUserHandler implements ICommandHandler<DeleteAvatarUserCommand> {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(command: DeleteAvatarUserCommand) /* : Promise<ObjResult<void>> */ {
    console.log('command in delete avatar user command:', command);

    // поиск avatar
    const avatar = await this.fileRepository.findAvatar({ userId: command.inputModel.userId });
    console.log('avatar in delete avatar user command:', avatar);

    // что правильнне вернуть при !avatar???
    // если avatar не найден
    if (!avatar) {
      console.log('!avatar');
      return ObjResult.Err(new NotFoundError('avatar not found'));
    }

    avatar!.delete();
    console.log('avatar in delete avatar user command:', avatar);

    const updatingResult = await this.fileRepository.updateAvatar(avatar);
    console.log('updatingResult in delete avatar user command:', updatingResult);

    return ObjResult.Ok();
  }
}
