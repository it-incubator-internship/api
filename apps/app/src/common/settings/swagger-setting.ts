/* eslint-disable @typescript-eslint/explicit-function-return-type,@typescript-eslint/ban-ts-comment */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swaggerSetting = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setVersion('0.1')
    .addBearerAuth()
    .addServer('/api/v1') // Устанавливаем базовый путь для всех маршрутов
    .build();

  const document = SwaggerModule.createDocument(app, config);
  console.log('swagger is enabled, /swagger ');
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/json',
  });
};
