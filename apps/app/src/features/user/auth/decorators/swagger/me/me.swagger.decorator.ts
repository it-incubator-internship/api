import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AuthMeOutput } from '../../../dto/output/information.output.dto';

export function MeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Получение информации о текущем пользователе' }),
    ApiResponse({ status: 200, description: 'Информация о текущем пользователе получена.', type: AuthMeOutput }),
    ApiUnauthorizedResponse({
      status: 401,
      description: 'В случае отправки некорректного или просроченного accessToken.',
    }),
    ApiBearerAuth(),
  );
}
