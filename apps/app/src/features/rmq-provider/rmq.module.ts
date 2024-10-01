import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PrismaService } from '../../common/database_module/prisma-connection.service';

import { EventsRepository } from './events-db/events.repository';
import { EventsService } from './events-db/events.service';
import { GetAvatarsFromFileMcsHandler } from './command/get-avatar-from-files-mcs.command';
import { RmqConsumer } from './rmq.consumer';

const commands = [GetAvatarsFromFileMcsHandler];

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MULTICAST_EXCHANGE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://navaibeadmin:navaibeadmin@91.108.243.169:5672/test_vhost'],
          queue: 'app_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [RmqConsumer],
  providers: [EventsRepository, PrismaService, EventsService, ...commands],
  exports: [EventsService],
})
export class RmqModule {}
