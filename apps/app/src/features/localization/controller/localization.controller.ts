import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LocalizationQueryRepository } from '../repository/localization.repository';
import { GetAllCountriesSwagger } from '../decorators/swagger/get-all-countries/get-all-countries.swagger.decorator';
import { GetAllCitiesSwagger } from '../decorators/swagger/get-all-cities/get-all-cities.swagger.decorator';
import { NotFoundError } from '../../../../../common/utils/result/custom-error';
import { AllCountriesOutput } from '../dto/output/all-countries.output.dto';
import { AllCitiesOutput } from '../dto/output/all-cities.output.dto';

@ApiTags('localization')
@Controller('localization')
export class LocalizationController {
  constructor(private localizationRepository: LocalizationQueryRepository) {}

  @Get('countries')
  @GetAllCountriesSwagger()
  async getAllCounties(): Promise<AllCountriesOutput[]> {
    const countries = await this.localizationRepository.findAllCountries();

    return countries;
  }

  @Get('cities/:id')
  @GetAllCitiesSwagger()
  async getAllCitiesByCountryId(@Param('id') countryId: number): Promise<AllCitiesOutput[] | null> {
    const cities = await this.localizationRepository.findAllCitiesByCountryId({ id: countryId });

    if (!cities) {
      throw new NotFoundError('cities not found');
    }

    return cities;
  }
}
