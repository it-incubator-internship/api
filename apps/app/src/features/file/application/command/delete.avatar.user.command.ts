import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../user/user/repository/user.repository';
import { EntityEnum } from '../../../../../../common/repository/base.repository';
import { ProfileEntityNEW } from '../../../user/user/domain/account-data.entity';
import { EventsService } from '../../../rmq-provider/events-db/events.service';
import { $Enums } from '../../../../../prisma/client';

import Entity = $Enums.Entity;
import EventType = $Enums.EventType;
import EventStatus = $Enums.EventStatus;

export class DeleteAvatarUserCommand {
  constructor(public inputModel: { userId: string }) {}
}

@CommandHandler(DeleteAvatarUserCommand)
export class DeleteAvatarUserHandler implements ICommandHandler<DeleteAvatarUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventsService: EventsService,
  ) {}

  async execute(command: DeleteAvatarUserCommand): Promise<ObjResult<void>> {
    // поиск profile по id
    const profile: ProfileEntityNEW = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: command.inputModel.userId },
    });

    // если profile по id не найден
    if (!profile) {
      return ObjResult.Err(new NotFoundError('profile not found'));
    }

    profile.deleteAvatarUrl();

    await this.userRepository.updateOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: profile.profileId },
      data: profile,
    });

    // логика по добавлению event
    await this.eventsService.addEvent({
      parentId: command.inputModel.userId,
      entity: Entity.PROFILE,
      eventStatus: EventStatus.READY,
      eventType: EventType.DELETE,
    });

    return ObjResult.Ok();
  }
}
