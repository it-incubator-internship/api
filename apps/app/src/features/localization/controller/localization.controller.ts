import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LocalizationQueryRepository } from '../repository/localization.repository';

@ApiTags('localization')
@Controller('localization')
export class LocalizationController {
  constructor(private localizationRepository: LocalizationQueryRepository) {}

  @Get('countries')
  // @GetAllCountriesSwagger()
  async getAllCounties() /* : Promise<UserProfileOutputDto> */ {
    const countries = await this.localizationRepository.findAllCountries();
    console.log('countries in localization controller:', countries);

    return countries;
  }

  @Get('cities/:id')
  // @GetAllCitiesSwagger()
  async getAllCitiesByCountryId(@Param('id') countryId: number) /* : Promise<UserProfileOutputDto> */ {
    const cities = await this.localizationRepository.findAllCitiesByCountryId({ id: countryId });
    console.log('cities in localization controller:', cities);

    return cities;
  }
}
