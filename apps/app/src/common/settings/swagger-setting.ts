/* eslint-disable @typescript-eslint/explicit-function-return-type,@typescript-eslint/ban-ts-comment */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swaggerSetting = (app: INestApplication, apiPrefix: string) => {
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setVersion('0.1')
    .addBearerAuth()
    .addServer(apiPrefix) // Устанавливаем базовый путь для всех маршрутов
    .build();

  console.log(`/${apiPrefix}/swagger/json`);

  const document = SwaggerModule.createDocument(app, config);
  console.log('swagger is enabled, /swagger ');
  SwaggerModule.setup(`/${apiPrefix}/swagger`, app, document, {
    jsonDocumentUrl: `/${apiPrefix}/swagger/json`,
  });
};
