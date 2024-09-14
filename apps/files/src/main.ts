// import { NestFactory } from '@nestjs/core';
// import { ConfigService } from '@nestjs/config';

// import { ConfigurationType } from '../../app/src/common/settings/configuration';
// import { swaggerSetting } from '../../app/src/common/settings/swagger-setting';

// import { FilesModule } from './files.module';

// async function bootstrap() {
//   const app = await NestFactory.create(FilesModule);

  //достаем env
  // const configService = app.get(ConfigService<ConfigurationType, true>);
  // console.log('configService in main.ts (files):', configService);

  // const apiPrefix = configService.get('apiSettings.API_PREFIX', { infer: true });
  // console.log('apiPrefix in main.ts (files):', apiPrefix);

  // const port = configService.get('apiSettings.PORT', { infer: true });
  // console.log('port in main.ts (files):', port);

  // const isTestingENV = configService.get('environmentSettings.isTesting', { infer: true });
  // console.log('isTestingENV in main.ts (files):', isTestingENV);

  // if (!isTestingENV) {
  //   swaggerSetting(app, apiPrefix);
  // }

  // app.setGlobalPrefix(apiPrefix);
  // console.log(port);
  // console.log('prefix', apiPrefix);

//   await app.init();
//   // await app.listen(port);
//   await app.listen(3002);
// }
// bootstrap();
