import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { PaymentModule } from './payments.module';

async function bootstrap() {
  // Создаем основное HTTP-приложение
  const app = await NestFactory.create(PaymentModule);

  // Подключаем RabbitMQ транспорт
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:56722'],
      queue: 'payments_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // Запускаем оба транспорта: HTTP и RMQ
  await app.startAllMicroservices();
  await app.listen(4001);
}

bootstrap();
