import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { OutputSession } from '../../../dto/output/all-sessions.output.dto';

export function GetAllUserSessionsSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Список активных сессий.' }),
    ApiResponse({ status: 200, type: [OutputSession] }),
    ApiUnauthorizedResponse({
      status: 401,
      description: 'В случае отправки некорректного или просроченного refreshToken.',
    }),
    ApiBearerAuth(),
  );
}
