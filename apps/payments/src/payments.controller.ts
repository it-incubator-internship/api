import { Controller, Get } from '@nestjs/common';

import { PaymentService } from './payments.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentsService: PaymentService) {}

  @Get()
  getHello(): string {
    return this.paymentsService.getHello();
  }
}
