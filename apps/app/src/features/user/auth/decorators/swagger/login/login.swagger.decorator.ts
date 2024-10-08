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
import { AccessTokenOutput } from '../../../dto/output/login.output.dto';

export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Вход в систему' }),
    ApiBody({ type: () => LoginUserInputModel }),
    ApiResponse({
      status: 201,
      description:
        'Login произведён. JWT accessToken возвращается в body. JWT refreshToken возвращается в cookie (http-only, secure).',
      type: () => AccessTokenOutput,
    }),
    ApiBadRequestResponse({
      status: 400,
      description: 'В случае ввода некорректных данных.',
      type: () => BasicBadRequestOutputType,
    }),
    // TODO переговорить с фронтом по поводу редиректа
    ApiForbiddenResponse({ status: 403, description: 'В случае неподтверждённого аккаунта.' }),
    ApiUnauthorizedResponse({ status: 401, description: 'В случае неправильного логина или пароля.' }),
  );
}
