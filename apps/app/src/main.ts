import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './common/settings/apply-app-setting';
import { ConfigurationType } from './common/settings/configuration';
import { ConfigService } from '@nestjs/config';
// import { CustomExceptionFilter, ErrorExceptionFilter } from 'apps/common/utils/result/exceprion-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app);
  const configService = app.get(ConfigService<ConfigurationType, true>);
  const apiPrefix = configService.get('apiSettings.API_PREFIX', { infer: true });
  const port = configService.get('apiSettings.PORT', { infer: true });

  app.setGlobalPrefix(apiPrefix);
  console.log(port);
  console.log('prefix', apiPrefix);

  app.enableCors();
  await app.init();
  await app.listen(port);
}
bootstrap();
