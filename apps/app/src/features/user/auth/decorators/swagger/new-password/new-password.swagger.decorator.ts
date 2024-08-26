import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

// import { UserRegistrationOutputDto } from '../../../dto/output/registratio.output.dto';
import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';

export function NewPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Смена пароля' }),
    ApiResponse({ status: 201 /* , type: () => UserRegistrationOutputDto */ }),
    ApiBadRequestResponse({ status: 400, type: () => BasicBadRequestOutputType }),
  );
}
