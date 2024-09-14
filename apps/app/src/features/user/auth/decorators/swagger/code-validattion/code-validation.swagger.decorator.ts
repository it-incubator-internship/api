import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { BasicForbidenErrorOutput } from '../../../../../../common/models/basic-firbiden-error.output';

// import { UserRegistrationOutputDto } from '../../../dto/output/registratio.output.dto';

export function CodeValidationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Проверка кода потдверждения (jwt)' }),
    ApiResponse({ status: 201, description: 'Код (jwt) валидный.' }),
    ApiUnauthorizedResponse({ status: 401, description: 'В случае отправки некорректного кода (jwt).' }),
    ApiForbiddenResponse({
      status: 403,
      description: 'Если код (jwt) экспарился. Email находится в возвращаемой ошибке в виде строки в message.',
      type: () => BasicForbidenErrorOutput,
    }),
  );
}
