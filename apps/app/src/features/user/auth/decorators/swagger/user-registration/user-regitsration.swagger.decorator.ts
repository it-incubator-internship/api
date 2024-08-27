import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { UserRegistrationOutputDto } from '../../../dto/output/registratio.output.dto';
import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';
import { RegistrationUserInputModel } from '../../../dto/input/registration.user.dto';

export function UserRegitsrationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Регистрация пользователя' }),
    ApiBody({ type: () => RegistrationUserInputModel }),
    ApiResponse({ status: 201, type: () => UserRegistrationOutputDto }),
    ApiBadRequestResponse({ status: 400, type: () => BasicBadRequestOutputType }),
  );
}
