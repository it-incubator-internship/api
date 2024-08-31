import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GoogleAuthSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Редирект на googleApi' }),
    ApiResponse({
      status: 200,
      description: 'Редирект данных на googleApi произведён.',
    }),
  );
}
