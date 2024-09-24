import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../app/src/common/database_module/prisma-connection.service';

@Injectable()
export class LocalizationQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllCountries() /* : Promise<AuthMeOutput | null> */ {
    const countries = await this.prismaService.countries.findMany();
    console.log('countries in city repository:', countries);

    // if (!countries) return null;

    return countries;
  }

  async findAllCitiesByCountryId({ id }: { id: number }) /* : Promise<UserProfileOutputDto | null> */ {
    const cities = await this.prismaService.cities.findMany({
      where: {
        country_id: id,
      },
    });
    console.log('cities in city repository:', cities);

    // if (!cities) return null;

    return cities;
  }
}
