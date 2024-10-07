import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ImageStorageAdapter } from '../../../../../../files/src/common/adapters/img/image.storage.adapter';
import { ObjResult } from '../../../../../../common/utils/result/object-result';

type DeleteAvatarType = {
  smallAvatarUrl: string;
  originalAvatarUrl: string;
};

export class DeleteAvatarUserCommand {
  constructor(public inputModel: DeleteAvatarType) {}
}

@CommandHandler(DeleteAvatarUserCommand)
export class DeleteAvatarUserHandler implements ICommandHandler<DeleteAvatarUserCommand> {
  constructor(private readonly s3StorageAdapter: ImageStorageAdapter) {}

  async execute(command: DeleteAvatarUserCommand): Promise<ObjResult<void>> {
    console.log('console.log in delete avatar user command');
    console.log('command in delete avatar user command:', command);

    await Promise.all([
      this.s3StorageAdapter.deleteAvatar({ url: command.inputModel.smallAvatarUrl }),
      this.s3StorageAdapter.deleteAvatar({ url: command.inputModel.originalAvatarUrl }),
    ]);

    return ObjResult.Ok();
  }
}
