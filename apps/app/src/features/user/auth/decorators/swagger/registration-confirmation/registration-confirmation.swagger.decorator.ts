import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';

export function RegistrationConfirmationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Подтверждение регистрации' }),
    ApiResponse({ status: 201, description: 'Email подтверждён. Аккаунт активирован.' }),
    ApiBadRequestResponse({
      status: 400,
      description: 'В случае ввода некорректных данных.',
      type: () => BasicBadRequestOutputType,
    }),
  );
}
