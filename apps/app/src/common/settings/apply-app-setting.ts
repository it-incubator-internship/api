import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import {
  CustomExceptionFilter,
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../../../../common/utils/result/exceprion-filter';
import { BadRequestError } from '../../../../common/utils/result/custom-error';

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

  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://navaibe.ru/', 'https://29e6d4f00fc4acc71876d1a834bcda48.serveo.net/'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization', 'X-Client-IP'],
  });

  /**
   * exception filters, заполнять снизу вверх
   */

  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter(), new CustomExceptionFilter());
};
