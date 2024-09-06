import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { UserRegistrationOutputDto } from '../../../dto/output/registratio.output.dto';
import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';

export function PasswordRecoveryResendingSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Повторное восстановление пароля' }),
    ApiResponse({
      status: 201,
      description: 'Код подтверждения смены пароля отправлен на указанную почту.',
      type: () => UserRegistrationOutputDto,
    }),
    ApiBadRequestResponse({
      status: 400,
      description: 'В случае ввода некорректных данных или отсутствие такого email в системе',
      type: () => BasicBadRequestOutputType,
    }),
  );
}
