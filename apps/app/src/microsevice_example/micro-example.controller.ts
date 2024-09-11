import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';

@ApiTags('MicroExample')
@Controller('microExample')
export class MicroExampleController {
  constructor(@Inject('PAYMENTS_SERVICE') private readonly gatewayProxyClient: ClientProxy) {}

  @Get('/:text')
  async getHello(@Param('text') text: string) {
    try {
      return this.gatewayProxyClient.send<string>({ cmd: 'hello' }, text);
    } catch (e) {
      console.log(e);
    }
  }
}
