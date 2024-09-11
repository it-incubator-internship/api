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
      urls: ['amqp://localhost:15671'],
      queue: 'payments_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // Запускаем оба транспорта: HTTP и RMQ
  await app.startAllMicroservices();
  await app.listen(3001); // HTTP приложение будет доступно на порту 3000
}

bootstrap();
