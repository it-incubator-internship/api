import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { CustomExceptionFilter, ErrorExceptionFilter } from '../../../../common/utils/result/exceprion-filter';

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
};
