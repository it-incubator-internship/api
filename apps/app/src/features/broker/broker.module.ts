import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { ConfigurationType } from '../../common/settings/configuration';
import { multicastQueue } from '../../../../common/constants/constants';

import { BrokerAdapter } from './broker.adapter';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MULTICAST_EXCHANGE',
        useFactory: (configService: ConfigService<ConfigurationType, true>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('apiSettings.RMQ_HOST', { infer: true }) as string],
            queue: multicastQueue,
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [BrokerAdapter],
  exports: [BrokerAdapter],
})
export class BrokerModule {}
