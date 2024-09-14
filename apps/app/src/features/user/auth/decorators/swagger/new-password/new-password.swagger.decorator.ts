import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';
import { BasicForbidenErrorOutput } from '../../../../../../common/models/basic-firbiden-error.output';

export function NewPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Смена пароля' }),
    ApiResponse({ status: 201, description: 'Смена password произведена.' }),
    ApiBadRequestResponse({
      status: 400,
      description: 'В случае ввода некорректных данных.',
      type: () => BasicBadRequestOutputType,
    }),
    ApiForbiddenResponse({
      status: 403,
      description: 'Если код (jwt) экспарился',
      type: () => BasicForbidenErrorOutput,
    }),
  );
}
