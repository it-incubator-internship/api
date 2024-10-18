import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Interval } from '@nestjs/schedule';

import { FileRepository } from '../features/files/repository/file.repository';
import { FileType } from '../features/files/schema/files.schema';
import { DeleteAvatarUserCommand } from '../features/files/application/command/delete.avatar.user.command';
import { avatarShedulerInterval } from '../common/constants/constants';

@Injectable()
export class AvatarSheduler {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Interval(avatarShedulerInterval) // Интервал в миллисекундах
  async handleInterval() {
    const avatars = await this.fileRepository.findDeletedAvatars();

    avatars.forEach((a) => {
      if (a.type === FileType.avatar && a.deletedAt !== null) {
        this.commandBus.execute(
          new DeleteAvatarUserCommand({ id: a.id, smallAvatarUrl: a.url.small!, originalAvatarUrl: a.url.original! }),
        );
      }
    });
  }
}
