import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Interval } from '@nestjs/schedule';

// import { FileRepository } from '../features/files/repository/file.repository';
import { avatarShedulerInterval } from '../common/constants/constants';
import { SendUploadResultCommand } from '../features/files/application/command/send.upload.result.command';
import { FileUploadRepository } from '../features/files/repository/file-upload-result.repository';

@Injectable()
export class UploadSheduler {
  constructor(
    // private readonly fileRepository: FileRepository,
    private readonly fileUploadRepository: FileUploadRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Interval(avatarShedulerInterval) // Интервал в миллисекундах
  async handleInterval() {
    const uploadResults = await this.fileUploadRepository.findUploadResults();

    uploadResults.forEach((u) => {
      try {
        this.commandBus.execute(new SendUploadResultCommand(u));
      } catch {
        // TODO logger
        console.error('error in upload sheduler');
      }
    });
  }
}
