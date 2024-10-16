import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';

import { ImageStorageAdapter } from '../../../../../../files/src/common/adapters/img/image.storage.adapter';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { FileRepository } from '../../repository/file.repository';

type DeleteAvatarType = {
  id: Types.ObjectId;
  smallAvatarUrl: string;
  originalAvatarUrl: string;
};

export class DeleteAvatarUserCommand {
  constructor(public inputModel: DeleteAvatarType) {}
}

@CommandHandler(DeleteAvatarUserCommand)
export class DeleteAvatarUserHandler implements ICommandHandler<DeleteAvatarUserCommand> {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly s3StorageAdapter: ImageStorageAdapter,
  ) {}

  async execute(command: DeleteAvatarUserCommand): Promise<ObjResult<void>> {
    await this.fileRepository.deleteAvatar({ id: command.inputModel.id }); // удаление из коллекции

    try {
      await Promise.all([
        this.s3StorageAdapter.deleteAvatar({ url: command.inputModel.smallAvatarUrl.slice(-55) }),
        this.s3StorageAdapter.deleteAvatar({ url: command.inputModel.originalAvatarUrl.slice(-55) }),
      ]);
    } catch {
      console.error('Error in delete avatar user command');
    }

    return ObjResult.Ok();
  }
}
