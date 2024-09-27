import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../user/user/repository/user.repository';
import { EntityEnum } from '../../../../../../common/repository/base.repository';
import { ProfileEntityNEW } from '../../../user/user/domain/account-data.entity';
import { NotFoundError } from '../../../../../../common/utils/result/custom-error';

type AddAvatarType = {
  userId: string;
  avatarUrl: string;
};

export class UploadAvatarUserCommand {
  constructor(public inputModel: AddAvatarType) {}
}

@CommandHandler(UploadAvatarUserCommand)
export class UploadAvatarUserHandler implements ICommandHandler<UploadAvatarUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UploadAvatarUserCommand) /* : Promise<ObjResult<void>> */ {
    console.log('command in add avatar user command:', command);

    // поиск profile по id
    const profile: ProfileEntityNEW = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: command.inputModel.userId },
    });
    console.log('profile in add avatar user command:', profile);

    // если profile не найден
    if (!profile) {
      console.log('!profile');
      return ObjResult.Err(new NotFoundError('profile not found'));
    }

    // если profile найден
    profile.addAvatarUrl({ avatarUrl: command.inputModel.avatarUrl });
    console.log('profile in add avatar user command:', profile);

    await this.userRepository.updateOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: profile.profileId },
      data: profile,
    });

    return ObjResult.Ok();
  }
}
