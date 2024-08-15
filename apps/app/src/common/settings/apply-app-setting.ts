import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { CustomExceptionFilter, ErrorExceptionFilter } from '../../../../common/utils/result/exceprion-filter';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './configuration';

export const appSettings = (app: INestApplication) => {
  app.use(cookieParser());
  /**
   * подключение class - validator для валидации входящих параметров
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * exception filters, заполнять снизу вверх
   */
  app.useGlobalFilters(new ErrorExceptionFilter(), new CustomExceptionFilter());

  const configService = app.get(ConfigService<ConfigurationType, true>);
  const apiPrefix = configService.get('apiSettings.API_PREFIX', { infer: true });
  const port = configService.get('apiSettings.PORT', { infer: true });

  app.setGlobalPrefix(apiPrefix);
  console.log(port);
  console.log('prefix', apiPrefix);
};
