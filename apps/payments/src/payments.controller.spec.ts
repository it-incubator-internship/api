import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payments.controller';
import { PaymentService } from './payments.service';

describe('PaymentsController', () => {
  let paymentsController: any;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [PaymentService],
    }).compile();

    paymentsController = app.get<PaymentController>(PaymentController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(paymentsController.getHello()).toBe('Hello World!');
    });
  });
});
