import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { appSettings } from './common/settings/apply-app-setting';
import { ConfigurationType } from './common/settings/configuration';
import { swaggerSetting } from './common/settings/swagger-setting';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSettings(app);
  // Подключаем RabbitMQ транспорт
  //TODO конфиг
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://navaibeadmin:navaibeadmin@91.108.243.169:5672/test_vhost'],
      queue: 'app_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  //достаем env
  const configService = app.get(ConfigService<ConfigurationType, true>);
  const apiPrefix = configService.get('apiSettings.API_PREFIX', { infer: true });
  const port = configService.get('apiSettings.PORT', { infer: true });
  const isTestingENV = configService.get('environmentSettings.isTesting', { infer: true });

  if (!isTestingENV) {
    swaggerSetting(app, apiPrefix);
  }
  app.use(compression());
  app.setGlobalPrefix(apiPrefix);
  console.log(port);
  console.log('prefix', apiPrefix);

  await app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
