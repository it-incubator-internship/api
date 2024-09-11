import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, TcpOptions, Transport } from '@nestjs/microservices';

import { PaymentModule } from './payments.module';

async function bootstrap() {
  const tcpOptions: TcpOptions = {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001,
    },
  };

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(PaymentModule, tcpOptions);

  await app.listen();
}
bootstrap();
