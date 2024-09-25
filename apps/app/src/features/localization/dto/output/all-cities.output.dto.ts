import { ApiProperty } from '@nestjs/swagger';

export class AllCitiesOutput {
  @ApiProperty({
    example: 12345,
    description: 'id города',
  })
  city_id: number;

  @ApiProperty({
    example: 12345,
    description: 'id страны',
  })
  country_id: number;

  @ApiProperty({
    example: 'Las Vegas',
    nullable: true,
    description: 'название города',
  })
  title_ru: string | null;
}
