import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOperation, ApiResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';

import { UserRegistrationOutputDto } from '../../../dto/output/registratio.output.dto';
import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';
import { RegistrationUserInputModel } from '../../../dto/input/registration.user.dto';

export function UserRegitsrationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Регистрация пользователя' }),
    ApiBody({ type: () => RegistrationUserInputModel }),
    ApiResponse({
      status: 201,
      description: 'Регистрация произведена. Код подтверждения отправлен на почту, указанную при регистрации.',
      type: () => UserRegistrationOutputDto,
    }),
    ApiBadRequestResponse({
      status: 400,
      description: 'В случае ввода некорректных данных.',
      type: () => BasicBadRequestOutputType,
    }),
    ApiTooManyRequestsResponse({
      status: 429,
      description: 'В случае превышения лимита количества запросов (более 5 запросов в течении 10 секунд).',
    }),
  );
}
