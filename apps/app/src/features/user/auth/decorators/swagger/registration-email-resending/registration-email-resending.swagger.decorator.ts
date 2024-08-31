import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { UserRegistrationOutputDto } from '../../../dto/output/registratio.output.dto';
import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';

export function RegistrationEmailResendingSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Повторная отправка кода подтверждения' }),
    ApiResponse({
      status: 201,
      description: 'Повторная отправка кода подтверждения произведена на указанную почту.',
      type: () => UserRegistrationOutputDto,
    }),
    ApiBadRequestResponse({
      status: 400,
      description: 'В случае ввода некорректных данных.',
      type: () => BasicBadRequestOutputType,
    }),
  );
}
