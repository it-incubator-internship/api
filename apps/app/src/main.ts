import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomExceptionFilter, ErrorExceptionFilter } from '../../common/utils/result/exceprion-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1'); //TODO перевести на конфиг сервис
  app.enableCors();
  app.useGlobalFilters(new ErrorExceptionFilter(), new CustomExceptionFilter());
  await app.listen(process.env.PORT || 3000); //TODO перевести на конфиг сервис
}
bootstrap();
