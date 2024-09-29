import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppExchangeController } from './app-exchange.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MULTICAST_EXCHANGE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://navaibeadmin:navaibeadmin@91.108.243.169/:56722'],
          queue: 'multicast_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppExchangeController],
  providers: [],
  exports: [],
})
export class AppExchangeModule {}
