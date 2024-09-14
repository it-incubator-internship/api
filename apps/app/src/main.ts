import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { appSettings } from './common/settings/apply-app-setting';
import { ConfigurationType } from './common/settings/configuration';
import { swaggerSetting } from './common/settings/swagger-setting';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSettings(app);

  //достаем env
  const configService = app.get(ConfigService<ConfigurationType, true>);
  console.log('configService in main.ts (app):', configService);

  const apiPrefix = configService.get('apiSettings.API_PREFIX', { infer: true });
  console.log('apiPrefix in main.ts (app):', apiPrefix);

  const port = configService.get('apiSettings.PORT', { infer: true });
  console.log('port in main.ts (app):', port);

  const isTestingENV = configService.get('environmentSettings.isTesting', { infer: true });
  console.log('isTestingENV in main.ts (app):', isTestingENV);

  if (!isTestingENV) {
    swaggerSetting(app, apiPrefix);
  }

  app.setGlobalPrefix(apiPrefix);
  console.log(port);
  console.log('prefix', apiPrefix);

  await app.init();
  await app.listen(port);
}
bootstrap();
