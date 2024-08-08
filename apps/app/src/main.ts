import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomExceptionFilter } from '../../common/utils/result/exceprion-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalFilters(new CustomExceptionFilter());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
