import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function RefreshTokenSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновление токенов' }),
    ApiResponse({ status: 201 }),
    ApiUnauthorizedResponse({ status: 401 }),
    ApiSecurity('refreshToken'),
  );
}
