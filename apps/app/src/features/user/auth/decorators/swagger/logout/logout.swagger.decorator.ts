import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function LogoutSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Выход из системы' }),
    ApiResponse({ status: 201, description: 'Logout произведён.' }),
    ApiUnauthorizedResponse({
      status: 401,
      description: 'В случае отправки некорректного или просроченного refreshToken.',
    }),
    ApiSecurity('refreshToken'),
  );
}
