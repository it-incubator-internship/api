import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AllCountriesOutput } from '../../../dto/output/all-countries.output.dto';

export function GetAllCountriesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Получение списка стран' }),
    ApiResponse({
      status: 200,
      description: 'Список стран получен.',
      type: [AllCountriesOutput],
    }),
  );
}
