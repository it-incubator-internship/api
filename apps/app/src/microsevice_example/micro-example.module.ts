import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { MicroExampleController } from './micro-example.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MULTICAST_EXCHANGE',
        transport: Transport.TCP,
        options: {
          urls: ['amqp://guest:guest@localhost:56722'],
          queue: 'multicast_queue',
          queueOptions: {
            durable: true,
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
