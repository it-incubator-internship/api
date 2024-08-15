import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './common/settings/apply-app-setting';
// import { CustomExceptionFilter, ErrorExceptionFilter } from 'apps/common/utils/result/exceprion-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app);
  app.setGlobalPrefix('api/v1'); //TODO перевести на конфиг сервис
  console.log('prefix', 'api/v1');
  // app.enableCors();
  // app.useGlobalFilters(new ErrorExceptionFilter(), new CustomExceptionFilter());
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     stopAtFirstError: true,
  //     exceptionFactory: (errors) => {
  //       const result = errors.map((e) => ({
  //         message: Object.values(e.constraints!)[0],
  //         field: e.property,
  //       }));
  //       throw new BadRequestException(result);
  //     },
  //   }),
  // );
  await app.listen(process.env.PORT || 3000); //TODO перевести на конфиг сервис
}
bootstrap();
