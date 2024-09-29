import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';

import { AvatarSavedEvent } from '../../../../files/src/features/files/controller/file-upload.controller';

@ApiTags('rmq')
@Controller('rmq')
export class AppExchangeController {
  constructor() {}

  //TODO вынести патерн
  @MessagePattern({ cmd: 'avatar-saved' })
  async getImgFromFiles(data: AvatarSavedEvent) {
    console.log(data);
  }
}
