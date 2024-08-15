import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
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
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const result = errors.map((e) => ({
          message: Object.values(e.constraints!)[0],
          field: e.property,
        }));
        throw new BadRequestException(result);
      },
    }),
  );

  /**
   * exception filters, заполнять снизу вверх
   */

  app.useGlobalFilters(new ErrorExceptionFilter(), new CustomExceptionFilter());

  const configService = app.get(ConfigService<ConfigurationType, true>);
  const apiPrefix = configService.get('apiSettings.API_PREFIX', { infer: true });
  const port = configService.get('apiSettings.PORT', { infer: true });

  console.log(port);
  console.log('prefix', apiPrefix);
};
