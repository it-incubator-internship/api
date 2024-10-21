import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

import { UserRegistrationOutputDto } from '../../../dto/output/registratio.output.dto';
import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';

export function PasswordRecoverySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Восстановление пароля' }),
    ApiResponse({
      status: 201,
      description: 'Код подтверждения смены пароля отправлен на указанную почту.',
      type: () => UserRegistrationOutputDto,
    }),
    ApiBadRequestResponse({
      status: 400,
      description: 'В случае ввода некорректных данных.',
      type: () => BasicBadRequestOutputType,
    }),
    ApiForbiddenResponse({
      status: 403,
      description:
        'В случае отсутствия recaptchaToken, некорректного значения recaptchaToken или высокой вероятности того, что запрос делает бот.',
    }),
    ApiTooManyRequestsResponse({
      status: 429,
      description: 'В случае превышения лимита количества запросов (более 5 запросов в течении 10 секунд).',
    }),
  );
}
