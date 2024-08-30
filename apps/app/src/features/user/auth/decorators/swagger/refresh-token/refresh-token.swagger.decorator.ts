import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AccessTokenOutput } from '../../../dto/output/login.output.dto';

export function RefreshTokenSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновление токенов' }),
    ApiResponse({ status: 201, type: () => AccessTokenOutput }),
    ApiUnauthorizedResponse({ status: 401 }),
    ApiSecurity('refreshToken'),
  );
}
