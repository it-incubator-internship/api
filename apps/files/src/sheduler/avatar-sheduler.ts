import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Interval } from '@nestjs/schedule';

// import { Data, HandleEventForProfileAvatarCommand } from './command/handle-event-for-profile-avatar.command';
import { FileRepository } from '../features/files/repository/file.repository';
import { FileType } from '../features/files/schema/files.schema';
import { DeleteAvatarUserCommand } from '../features/files/application/command/delete.avatar.user.command';

@Injectable()
export class AvatarSheduler {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Interval(10000) // Интервал в миллисекундах
  async handleInterval() {
    // console.log('console.log in avatar sheduler');

    const avatars = await this.fileRepository.findDeletedAvatars();
    // console.log('avatars in avatar sheduler:', avatars);

    avatars.forEach((a) => {
      if (a.type === FileType.avatar && a.deletedAt !== null) {
        this.fileRepository.deleteAvatar({ id: a._id }); // удаление из коллекции
        this.commandBus.execute(
          new DeleteAvatarUserCommand({ smallAvatarUrl: a.url.small!, originalAvatarUrl: a.url.original! }),
        );
      }
    });
  }
}
