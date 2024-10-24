import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../user/user/repository/user.repository';
import { EntityEnum } from '../../../../../../common/repository/base.repository';
import { ProfileEntityNEW } from '../../../user/user/domain/account-data.entity';
import { BadRequestError, NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { $Enums } from '../../../../../prisma/client';
import { EventsService } from '../../../rmq-provider/events-db/events.service';

import ProfileStatus = $Enums.ProfileStatus;
import Entity = $Enums.Entity;
import EventType = $Enums.EventType;
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

  async execute(command: UploadAvatarUserCommand) {
    // поиск profile по id
    const profile: ProfileEntityNEW = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: command.inputModel.userId },
    });

    // если profile не найден
    if (!profile) {
      return ObjResult.Err(new NotFoundError('profile not found'));
    }

    // если profile находится в статусе pending
    if (profile.profileStatus === ProfileStatus.PENDING) {
      return ObjResult.Err(
        new BadRequestError('Image is in the process of loading', [
          {
            message: 'Image is in the process of loading',
            field: '',
          },
        ]),
      );
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
      eventType: EventType.CREATE,
    });

    return ObjResult.Ok({ eventId: result.id });
  }
}
