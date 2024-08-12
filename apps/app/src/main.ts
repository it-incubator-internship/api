import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomExceptionFilter, ErrorExceptionFilter } from '../../common/utils/result/exceprion-filter';
import { Prisma } from '../prisma/client';
import getLogLevel = Prisma.getLogLevel;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1'); //TODO перевести на конфиг сервис
  console.log('prefix', 'api/v1');
  app.enableCors();
  app.useGlobalFilters(new ErrorExceptionFilter(), new CustomExceptionFilter());
  await app.listen(process.env.PORT || 3000); //TODO перевести на конфиг сервис
}
bootstrap();
