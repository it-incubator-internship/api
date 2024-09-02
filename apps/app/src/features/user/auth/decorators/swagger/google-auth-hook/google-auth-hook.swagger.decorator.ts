import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GoogleAuthHookSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Webhook для googleApi' }),
    ApiResponse({
      status: 200,
      description:
        'Возврат данных от googleApi произведён. Регистрация пользователя произведена (если пользователь не регистрировался до этого). Login произведён. JWT accessToken возвращается в body. JWT refreshToken возвращается в cookie (http-only, secure).',
    }),
  );
}
