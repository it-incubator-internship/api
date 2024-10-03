import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../user/user/repository/user.repository';
import { EntityEnum } from '../../../../../../common/repository/base.repository';
import { ProfileEntityNEW } from '../../../user/user/domain/account-data.entity';

// type DeleteAvatarType = {
//   userId: string;
// };

export class DeleteAvatarUserCommand {
  constructor(public inputModel: { userId: string }) {}
}

@CommandHandler(DeleteAvatarUserCommand)
export class DeleteAvatarUserHandler implements ICommandHandler<DeleteAvatarUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeleteAvatarUserCommand) /* : Promise<ObjResult<void>> */ {
    console.log('command in delete avatar user command:', command);

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

    //TODO вызов file microservice

    return ObjResult.Ok();
  }
}
