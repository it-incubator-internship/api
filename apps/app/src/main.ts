import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomExceptionFilter, ErrorExceptionFilter } from '../../common/utils/result/exceprion-filter';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './common/settings/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<ConfigurationType, true>);
  const apiPrefix = configService.get('apiSettings.API_PREFIX', { infer: true });
  const port = configService.get('apiSettings.PORT', { infer: true });

  app.setGlobalPrefix(apiPrefix);
  console.log(port);
  console.log('prefix', apiPrefix);

  app.enableCors();
  app.useGlobalFilters(new ErrorExceptionFilter(), new CustomExceptionFilter());
  await app.init();
  await app.listen(port);
}
bootstrap();
