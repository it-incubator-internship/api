import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GithubAuthHookSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Webhook для githubApi' }),
    ApiResponse({
      status: 200,
      description:
        'Возврат данных от githubApi произведён. Регистрация пользователя произведена (если пользователь не регистрировался до этого). Login произведён. JWT accessToken возвращается в body. JWT refreshToken возвращается в cookie (http-only, secure).',
    }),
  );
}
