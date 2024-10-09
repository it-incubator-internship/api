import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { filesMcsQueue } from '../../common/constants/constants';

import { FilesModule } from './files.module';
import { ConfigurationType } from './common/settings/configuration';
import { swaggerSetting } from './common/settings/swagger.setting';
import { appSettings } from './common/settings/apply-files-setting';

async function bootstrap() {
  const app = await NestFactory.create(FilesModule);

  appSettings(app);
  // Подключаем RabbitMQ транспорт

  // достаем env
  const configService = app.get(ConfigService<ConfigurationType, true>);
  const port = configService.get('apiSettings.PORT', { infer: true });
  const isTestingENV = configService.get('environmentSettings.isTesting', { infer: true });
  const RMQ_URL = configService.get('apiSettings.RMQ_HOST', { infer: true }) as string;

  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://navaibe.ru/'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
  });

  if (!isTestingENV) {
    swaggerSetting(app);

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [RMQ_URL],
        queue: filesMcsQueue,
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  app.setGlobalPrefix(`api/v1`);

  console.log(port);

  await app.startAllMicroservices();
  await app.listen(port);
}

bootstrap();
