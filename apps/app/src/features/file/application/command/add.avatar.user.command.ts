import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../user/user/repository/user.repository';
import { EntityEnum } from '../../../../../../common/repository/base.repository';
import { ProfileEntityNEW } from '../../../user/user/domain/account-data.entity';

type AddAvatarType = {
  userId: string;
  avatarUrl: string;
};

export class AddAvatarUserCommand {
  constructor(public inputModel: AddAvatarType) {}
}

@CommandHandler(AddAvatarUserCommand)
export class AddAvatarUserHandler implements ICommandHandler<AddAvatarUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: AddAvatarUserCommand) /* : Promise<ObjResult<void>> */ {
    console.log('command in add avatar user command:', command);

    // поиск profile по id
    const profile: ProfileEntityNEW = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: command.inputModel.userId },
    });
    console.log('profile in delete avatar user command:', profile);

    // если profile по id не найден
    if (!profile) {
      console.log('!profile');
      return ObjResult.Err(new NotFoundError('user not found'));
    }

    profile.deleteAvatarUrl();
    console.log('profile in delete avatar user command:', profile);

    await this.userRepository.updateOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: profile.profileId },
      data: profile,
    });

    return ObjResult.Ok();
  }
}
