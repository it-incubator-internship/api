import { Module } from '@nestjs/common';

import { PaymentController } from './payments.controller';
import { PaymentService } from './payments.service';

@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
