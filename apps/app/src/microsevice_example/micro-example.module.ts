import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { MicroExampleController } from './micro-example.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'payments',
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [MicroExampleController],
  providers: [],
  exports: [],
})
export class MicroExampleModule {}
