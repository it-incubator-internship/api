import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function DeleteOtherSessionsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Закрытие сессии всех сессий кроме текущей' }),
    ApiResponse({ status: 204, description: 'Сессии закрыты.' }),
    ApiUnauthorizedResponse({
      status: 401,
      description: 'В случае отправки некорректного или просроченного refreshToken.',
    }),
    ApiBearerAuth(),
  );
}
