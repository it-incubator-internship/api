import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { BasicForbiddenErrorOutput } from '../../../../../../common/models/basic-forbidden-error.output';

export function RegistrationConfirmationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Подтверждение регистрации' }),
    ApiResponse({ status: 201, description: 'Email подтверждён. Аккаунт активирован.' }),
    ApiForbiddenResponse({
      status: 403,
      description: 'Если код (jwt) экспарился. Email находится message.',
      type: () => BasicForbiddenErrorOutput,
    }),
    ApiUnauthorizedResponse({ status: 401, description: 'В случае отправки некорректного кода (jwt).' }),
  );
}
