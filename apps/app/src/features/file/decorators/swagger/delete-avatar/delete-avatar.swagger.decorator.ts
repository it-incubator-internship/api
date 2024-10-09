import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeleteAvatarSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Удаление фото профиля' }),
    ApiResponse({
      status: 200,
      description: 'Фото профиля удалено.',
    }),
    ApiUnauthorizedResponse({
      status: 401,
      description: 'В случае отправки некорректного или просроченного accessToken.',
    }),
    ApiNotFoundResponse({
      status: 404,
      description: 'Profile не найден.',
    }),
    ApiBearerAuth(),
  );
}
