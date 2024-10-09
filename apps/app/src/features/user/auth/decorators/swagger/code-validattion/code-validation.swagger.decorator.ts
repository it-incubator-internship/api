import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { BasicForbiddenErrorOutput } from '../../../../../../common/models/basic-forbidden-error.output';

export function CodeValidationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Проверка кода потдверждения (jwt)' }),
    ApiResponse({ status: 201, description: 'Код (jwt) валидный.' }),
    ApiUnauthorizedResponse({ status: 401, description: 'В случае отправки некорректного кода (jwt).' }),
    ApiForbiddenResponse({
      status: 403,
      description: 'Если код (jwt) экспарился. Email находится в возвращаемой ошибке в виде строки в message.',
      type: () => BasicForbiddenErrorOutput,
    }),
  );
}
