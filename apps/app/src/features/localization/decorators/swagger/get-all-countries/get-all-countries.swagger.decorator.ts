import { applyDecorators } from '@nestjs/common';
import {
  // ApiBadRequestResponse,
  // ApiBearerAuth,
  // ApiBody,
  // ApiConsumes,
  ApiOperation,
  ApiResponse,
  // ApiUnauthorizedResponse,
} from '@nestjs/swagger';

// import { BasicBadRequestOutputType } from '../../../../../../../app/src/common/models/basic-badquest.output.type';

export function GetAllCountriesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Получение списка стран' }),
    // ApiConsumes('multipart/form-data'), // Указываем, что ожидается multipart/form-data
    // ApiBody({
    //   description: 'Загружаемое фото профиля',
    //   type: 'multipart/form-data', // Указываем, что это multipart
    //   required: true,
    //   schema: {
    //     type: 'object',
    //     properties: {
    //       file: {
    //         type: 'string',
    //         format: 'binary', // Указываем, что это файл
    //       },
    //     },
    //   },
    // }),
    ApiResponse({
      status: 200,
      description: 'Список стран получен.',
    }),
    // ApiBadRequestResponse({
    //   status: 400,
    //   description:
    //     'В случае попытки загрузки фото размером более 10Мб и/или не допустимого формата и/или отсутствия фото в запросе.',
    //   type: () => BasicBadRequestOutputType,
    // }),
    // ApiUnauthorizedResponse({
    //   status: 401,
    //   description: 'В случае отправки некорректного или просроченного accessToken.',
    // }),
    // ApiBearerAuth(),
  );
}
