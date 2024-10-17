import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

import {
  CustomExceptionFilter,
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../../../../common/utils/result/exceprion-filter';
import { BadRequestError } from '../../../../common/utils/result/custom-error';

import { ConfigurationType } from './configuration';

export const appSettings = (app: INestApplication) => {
  const configService = app.get(ConfigService<ConfigurationType, true>);
  const address = configService.get('addressSettings.address', { infer: true });

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

  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000', address],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
  });

  /**
   * exception filters, заполнять снизу вверх
   */

  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter(), new CustomExceptionFilter());
};
