import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { FileRepository } from '../../repository/file.repository';

// type DeleteAvatarType = {
//   userId: string;
// };

export class DeleteAvatarUserCommand {
  constructor(public inputModel: { userId: string }) /* DeleteAvatarType */ {}
}

@CommandHandler(DeleteAvatarUserCommand)
export class DeleteAvatarUserHandler implements ICommandHandler<DeleteAvatarUserCommand> {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(command: DeleteAvatarUserCommand) /* : Promise<ObjResult<void>> */ {
    console.log('command in delete avatar user command:', command);

    // поиск profile по id
    const avatar = await this.fileRepository.findAvatar({ userId: command.inputModel.userId });
    console.log('avatar in delete avatar user command:', avatar);

    // что правильнне вернуть при !avatar???
    if (!avatar) {
      console.log('!avatar');
      return /* null */;
    }

    avatar!.delete();
    console.log('avatar in delete avatar user command:', avatar);

    await this.fileRepository.saveAvatar(avatar);
  }
}
