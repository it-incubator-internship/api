import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

import { CustomExceptionFilter, ErrorExceptionFilter } from '../../../../common/utils/result/exceprion-filter';
import { BadRequestError } from '../../../../common/utils/result/custom-error';

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
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const result = errors.map((e) => ({
          message: Object.values(e.constraints!)[0],
          field: e.property,
        }));

        throw new BadRequestError('incorrect input dto', result);
      },
    }),
  );

  /**
   * exception filters, заполнять снизу вверх
   */

  app.useGlobalFilters( new ErrorExceptionFilter(), new HttpExceptionFilter(), new CustomExceptionFilter() );

  const configService = app.get(ConfigService<ConfigurationType, true>);
  const apiPrefix = configService.get('apiSettings.API_PREFIX', { infer: true });

  console.log('prefix', apiPrefix);
};
