import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function LogoutSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Выход из системы' }),
    ApiResponse({ status: 201 }),
    ApiUnauthorizedResponse({ status: 401 }),
    ApiSecurity('refreshToken'),
  );
}
