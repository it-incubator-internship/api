import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../user/user/repository/user.repository';
import { EntityEnum } from '../../../../../../common/repository/base.repository';
import { ProfileEntityNEW } from '../../../user/user/domain/account-data.entity';
import { NotFoundError } from '../../../../../../common/utils/result/custom-error';

type AddAvatarType = {
  userId: string;
  originalAvatarUrl: string;
  smallAvatarUrl: string;
};

export class UploadAvatarUserCommand {
  constructor(public inputModel: AddAvatarType) {}
}

@CommandHandler(UploadAvatarUserCommand)
export class UploadAvatarUserHandler implements ICommandHandler<UploadAvatarUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UploadAvatarUserCommand) /* : Promise<ObjResult<void>> */ {
    // поиск profile по id
    const profile: ProfileEntityNEW = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: command.inputModel.userId },
    });

    // если profile не найден
    if (!profile) {
      return ObjResult.Err(new NotFoundError('profile not found'));
    }

    // если profile найден
    profile.addAvatarUrl({
      originalAvatarUrl: command.inputModel.originalAvatarUrl,
      smallAvatarUrl: command.inputModel.smallAvatarUrl,
    });

    await this.userRepository.updateOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: profile.profileId },
      data: profile,
    });

    return ObjResult.Ok();
  }
}
