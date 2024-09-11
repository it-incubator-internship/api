import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { UserProfileOutputDto } from '../../../dto/output/user.profile.output.dto';

export function GetUserProfileSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Получение profile по id' }),
    ApiParam({ name: 'id', description: 'id запрашиваемого профиля', required: true, type: String }),
    ApiResponse({
      status: 200,
      description: 'Profile найден.',
      type: () => UserProfileOutputDto,
    }),
    ApiNotFoundResponse({
      status: 404,
      description: 'Profile не найден.',
    }),
  );
}
