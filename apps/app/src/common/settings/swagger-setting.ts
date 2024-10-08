/* eslint-disable @typescript-eslint/explicit-function-return-type,@typescript-eslint/ban-ts-comment */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export const swaggerSetting = (app: INestApplication, apiPrefix: string) => {
  console.log(apiPrefix, 'apiPrefix for swagger');
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setVersion('0.1')
    .addBearerAuth()
    .addServer(`/${apiPrefix}`)
    .addApiKey(
      {
        type: 'apiKey',
        name: 'refreshToken',
        in: 'header',
        description: 'рефреш токен для получения новой пары токенов',
      },
      'refreshToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    `/${apiPrefix}/scalar`,
    apiReference({
      themes: 'saturn',
      spec: {
        content: document,
      },
    }),
  );

  console.log('swagger is enabled, /swagger ');
  SwaggerModule.setup(`/${apiPrefix}/swagger`, app, document, {
    jsonDocumentUrl: `/${apiPrefix}/swagger/json`,
  });
};
