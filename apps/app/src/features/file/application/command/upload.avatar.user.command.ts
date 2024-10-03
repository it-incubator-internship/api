import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../user/user/repository/user.repository';
import { EntityEnum } from '../../../../../../common/repository/base.repository';
import { ProfileEntityNEW } from '../../../user/user/domain/account-data.entity';
import { NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { $Enums } from '../../../../../prisma/client';
import { EventsService } from '../../../rmq-provider/events-db/events.service';

import ProfileStatus = $Enums.ProfileStatus;
import Entity = $Enums.Entity;
import EventStatus = $Enums.EventStatus;

type AddAvatarType = {
  userId: string;
};

export class UploadAvatarUserCommand {
  constructor(public inputModel: AddAvatarType) {}
}

@CommandHandler(UploadAvatarUserCommand)
export class UploadAvatarUserHandler implements ICommandHandler<UploadAvatarUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventsService: EventsService,
  ) {}

  async execute(command: UploadAvatarUserCommand) /* : Promise<ObjResult<void>> */ {
    // поиск profile по id
    const profile: ProfileEntityNEW = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: command.inputModel.userId },
    });
    console.log('profile in upload avatar user command:', profile);

    // если profile не найден
    if (!profile) {
      console.log('!profile in upload avatar user command');
      return ObjResult.Err(new NotFoundError('profile not found'));
    }

    profile.profileStatus = ProfileStatus.PENDING;

    await this.userRepository.updateOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: profile.profileId },
      data: profile,
    });

    const result = await this.eventsService.addEvent({
      parentId: profile.profileId,
      entity: Entity.PROFILE,
      eventStatus: EventStatus.PENDING,
    });

    return ObjResult.Ok({ eventId: result.id });
  }
}
