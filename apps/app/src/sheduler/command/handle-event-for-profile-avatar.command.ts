import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { $Enums } from '../../../prisma/client';
import { UserRepository } from '../../features/user/user/repository/user.repository';
import { EntityEnum } from '../../../../common/repository/base.repository';
import { ProfileEntityNEW } from '../../features/user/user/domain/account-data.entity';

import Entity = $Enums.Entity;

export type Data = {
  parentId: string;
  entity: Entity;
  eventStatus: $Enums.EventStatus;
  proccesingDate: Date;
  data: { originalUrl: string; smallUrl: string } | null;
};

export class HandleEventForProfileAvatarCommand {
  constructor(public data: Data) {}
}

@CommandHandler(HandleEventForProfileAvatarCommand)
export class HandleEventForProfileAvatarHandler implements ICommandHandler<HandleEventForProfileAvatarCommand> {
  constructor(public userRepository: UserRepository) {}

  async execute(command: HandleEventForProfileAvatarCommand) {
    const { parentId, entity, eventStatus, proccesingDate, data } = command.data;

    if (entity !== Entity.PROFILE) throw new Error('wrong entity in event');

    const profile: ProfileEntityNEW = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: parentId },
    });

    if (!profile) throw new Error('profile not found');

    profile.profileStatus = eventStatus;
    profile.addAvatarUrl({
      originalAvatarUrl: data?.originalUrl || '',
      smallAvatarUrl: data?.smallUrl || '',
    });

    await this.userRepository.updateOne({
      modelName: EntityEnum.profile,
      conditions: { profileId: profile.profileId },
      data: profile,
    });
  }
}
