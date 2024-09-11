import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { BasicBadRequestOutputType } from '../../../../../../common/models/basic-badquest.output.type';
import { ProfileUserInputModel } from '../../../dto/input/profile.user.dto';

export function UpdateUserProfileSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Добавление/обновление информации в profile' }),
    ApiParam({ name: 'id', description: 'id запрашиваемого профиля', required: true, type: String }),
    ApiBody({ type: () => ProfileUserInputModel }),
    ApiResponse({
      status: 200,
      description: 'Информация в profile добавлена/обновлена.',
    }),
    ApiUnauthorizedResponse({
      status: 401,
      description: 'Если пользователь не авторизован.',
    }),
    ApiBadRequestResponse({
      status: 400,
      description: 'В случае ввода некорректных данных.',
      type: () => BasicBadRequestOutputType,
    }),
    ApiForbiddenResponse({
      status: 403,
      description: 'В случае попытки добавления/обновления информация в profile не принадлежащем текущему user.',
    }),
  );
}
