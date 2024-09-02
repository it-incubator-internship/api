import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AccessTokenOutput } from '../../../dto/output/login.output.dto';

export function RefreshTokenSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновление токенов' }),
    ApiResponse({
      status: 201,
      description:
        'Смена JWT accessToken и JWT refreshToken произведена. JWT accessToken возвращается в body. JWT refreshToken возвращается в cookie (http-only, secure).',
      type: () => AccessTokenOutput,
    }),
    ApiUnauthorizedResponse({ status: 401, description: 'В случае некорректного или просроченного refreshToken.' }),
    ApiSecurity('refreshToken'),
  );
}
