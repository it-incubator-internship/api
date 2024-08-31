import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GithubAuthSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Редирект на githubApi' }),
    ApiResponse({
      status: 200,
      description: 'Редирект данных на githubApi произведён.',
    }),
  );
}
