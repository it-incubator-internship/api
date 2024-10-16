import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { FileRepository } from '../../repository/file.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { FileEntity } from '../../schema/files.schema';

export class DeleteAvatarUrlUserCommand {
  constructor(public inputModel: { userId: string }) {}
}

@CommandHandler(DeleteAvatarUrlUserCommand)
export class DeleteAvatarUrlUserHandler implements ICommandHandler<DeleteAvatarUrlUserCommand> {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(command: DeleteAvatarUrlUserCommand): Promise<ObjResult<void>> {
    // поиск avatar
    // const avatar = await this.fileRepository.findAvatar({ userId: command.inputModel.userId });
    const avatars = await this.fileRepository.findAvatar({ userId: command.inputModel.userId });

    // если avatar не найден
    // if (!avatar) {
    //   return ObjResult.Err(new NotFoundError('avatar not found'));
    // }
    if (avatars.length === 0) {
      return ObjResult.Err(new NotFoundError('avatar not found'));
    }

    // avatar.delete();

    // await this.fileRepository.updateAvatar(avatar);
    avatars.forEach(async (a: FileEntity) => {
      a.delete();
      await this.fileRepository.updateAvatar(a);
    });

    return ObjResult.Ok();
  }
}
