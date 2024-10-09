import { Module } from '@nestjs/common';

import { PrismaService } from '../../common/database_module/prisma-connection.service';

import { EventsRepository } from './events-db/events.repository';
import { EventsService } from './events-db/events.service';
import { GetAvatarsFromFileMcsHandler } from './command/get-avatar-from-files-mcs.command';
import { RmqConsumer } from './rmq.consumer';

const commands = [GetAvatarsFromFileMcsHandler];

@Module({
  imports: [],
  controllers: [RmqConsumer],
  providers: [EventsRepository, PrismaService, EventsService, ...commands],
  exports: [EventsService],
})
export class RmqModule {}
