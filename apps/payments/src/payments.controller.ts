import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { PaymentService } from './payments.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentsService: PaymentService) {}

  @MessagePattern({ cmd: 'hello' })
  getHello(data: string): string {
    return data + 'PaymentController works!';
  }
}
