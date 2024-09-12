import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { MicroExampleController } from './micro-example.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MULTICAST_EXCHANGE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'multicast_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [MicroExampleController],
  providers: [],
  exports: [],
})
export class MicroExampleModule {}
