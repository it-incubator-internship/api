import { Controller, Get, Param } from '@nestjs/common';

import { LocalizationQueryRepository } from '../repository/localization.repository';
// import { ApiTags } from '@nestjs/swagger';

// @ApiTags('user')
@Controller('localization')
export class LocalizationController {
  constructor(private localizationRepository: LocalizationQueryRepository) {}

  @Get('countries')
  // @GetUserProfileSwagger()
  async getAllCounties() /* : Promise<UserProfileOutputDto> */ {
    const countries = await this.localizationRepository.findAllCountries();
    console.log('countries in localization controller:', countries);

    return countries;
  }

  @Get('cities/:id')
  // @GetUserProfileSwagger()
  async getAllCitiesByCountryId(@Param('id') countryId: number) /* : Promise<UserProfileOutputDto> */ {
    const cities = await this.localizationRepository.findAllCitiesByCountryId({ id: countryId });
    console.log('cities in localization controller:', cities);

    return cities;
  }
}
