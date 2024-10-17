import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CqrsModule } from '@nestjs/cqrs';

import { FileUploadModule } from '../features/files/files-upload.module';

import { AvatarSheduler } from './avatar-sheduler';
import { EventSheduler } from './event-sheduler';

@Module({
  imports: [ScheduleModule.forRoot(), CqrsModule.forRoot(), FileUploadModule],
  providers: [AvatarSheduler, EventSheduler],
})
export class AvatarShedulerModule {}
