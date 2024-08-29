import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';
import { LoginUserInputModel } from '../../../dto/input/login.user.dto';
import { UserLoginOutputDto } from '../../../dto/output/login.output.dto';

export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Вход в систему' }),
    ApiBody({ type: () => LoginUserInputModel }),
    ApiResponse({ status: 201, type: () => UserLoginOutputDto }),
    ApiBadRequestResponse({ status: 400, type: () => BasicBadRequestOutputType }),
    // TODO переговорить с фронтом по поводу редиректа
    ApiForbiddenResponse({ status: 403, description: 'в случае неподтверждённого аккаунта' }),
    ApiUnauthorizedResponse({ status: 401, description: 'в случае неправильного логина или пароля' }),
  );
}
