import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { FilesModule } from './files.module';
import { ConfigurationType } from './common/settings/configuration';
import { swaggerSetting } from './common/settings/swagger.setting';
import { appSettings } from './common/settings/apply-files-setting';

async function bootstrap() {
  const app = await NestFactory.create(FilesModule);

  appSettings(app);

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: ['amqp://navaibeadmin:navaibeadmin@91.108.243.169:5672/test_vhost'],
  //     //TODO app_queue
  //     queue: 'multicast_queue_local_files',
  //     queueOptions: {
  //       durable: true,
  //     },
  //   },
  // });

  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://navaibe.ru/'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
  });

  // достаем env
  const configService = app.get(ConfigService<ConfigurationType, true>);
  const port = configService.get('apiSettings.PORT', { infer: true });
  const isTestingENV = configService.get('environmentSettings.isTesting', { infer: true });

  if (!isTestingENV) {
    swaggerSetting(app);
  }

  app.setGlobalPrefix(`api/v1`);

  console.log(port);

  await app.init();
  await app.listen(port);
}

bootstrap();
