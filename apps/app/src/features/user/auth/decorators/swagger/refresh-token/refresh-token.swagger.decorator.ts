import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

import { UserRegistrationOutputDto } from '../../../dto/output/registratio.output.dto';
import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';

export function RefreshTokenSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновление токенов' }),
    ApiResponse({ status: 201, type: () => UserRegistrationOutputDto }),
    ApiBadRequestResponse({ status: 400, type: () => BasicBadRequestOutputType }),
    ApiSecurity('refreshToken'),
  );
}
