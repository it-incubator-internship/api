import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function DeleteCurrentSessionSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Закрытие сессии по id' }),
    ApiResponse({ status: 204, description: 'Сессия закрыта.' }),
    ApiResponse({ status: 400, description: 'id сессии имеет не корректный формат.' }),
    ApiResponse({ status: 403, description: 'При попытке закрыть чужую сессию.' }),
    ApiParam({ name: 'deviceUuid', type: String, description: 'ID сессии.' }),
    ApiUnauthorizedResponse({
      status: 401,
      description: 'В случае отправки некорректного или просроченного refreshToken.',
    }),
    ApiBearerAuth(),
  );
}
