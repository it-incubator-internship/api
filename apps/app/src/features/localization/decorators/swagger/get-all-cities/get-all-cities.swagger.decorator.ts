import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { AllCitiesOutput } from '../../../dto/output/all-cities.output.dto';

export function GetAllCitiesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Получение списка городов, соответствующих конкретной стране' }),
    ApiParam({ name: 'id', description: 'id страны, для которой запрашиваются города', required: true, type: String }),
    ApiResponse({
      status: 200,
      description: 'Список городов получен.',
      type: [AllCitiesOutput],
    }),
    ApiNotFoundResponse({
      status: 404,
      description: 'Города не найдены.',
    }),
  );
}
