import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { FilesModule } from './files.module';
import { ConfigurationType } from './common/settings/configuration';
import { swaggerSetting } from './common/settings/swagger.setting';
import { appSettings } from './common/settings/apply-files-setting';

async function bootstrap() {
  const app = await NestFactory.create(FilesModule);

  appSettings(app);

  // достаем env
  const configService = app.get(ConfigService<ConfigurationType, true>);
  const port = configService.get('apiSettings.PORT', { infer: true });
  const isTestingENV = configService.get('environmentSettings.isTesting', { infer: true });

  if (!isTestingENV) {
    swaggerSetting(app);
  }

  console.log(port);

  await app.init();
  await app.listen(port);
}
bootstrap();
