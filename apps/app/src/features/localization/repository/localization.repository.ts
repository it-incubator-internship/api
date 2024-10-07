import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/database_module/prisma-connection.service';
import { AllCountriesOutput } from '../dto/output/all-countries.output.dto';
import { AllCitiesOutput } from '../dto/output/all-cities.output.dto';

@Injectable()
export class LocalizationQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllCountries(): Promise<AllCountriesOutput[]> {
    return this.prismaService.countries.findMany({
      orderBy: {
        country_id: 'asc',
      },
    });
  }

  async findAllCitiesByCountryId({ id }: { id: number }): Promise<AllCitiesOutput[] | null> {
    const cities = await this.prismaService.cities.findMany({
      where: {
        country_id: id,
      },
      orderBy: {
        city_id: 'asc',
      },
    });

    if (cities.length === 0) return null;

    return cities;
  }
}
