import { NestFactory } from '@nestjs/core';

import { PaymentModule } from './payments.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule);
  await app.listen(3001);
}
bootstrap();
