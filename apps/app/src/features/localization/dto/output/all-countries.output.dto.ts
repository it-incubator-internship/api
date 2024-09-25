import { ApiProperty } from '@nestjs/swagger';

export class AllCountriesOutput {
  @ApiProperty({
    example: 12345,
    description: 'id страны',
  })
  country_id: number;

  @ApiProperty({
    example: 'Гондурас',
    nullable: true,
    description: 'название страны на русском языке',
  })
  title_ru: string | null;

  @ApiProperty({
    example: 'Honduras',
    nullable: true,
    description: 'название страны на английском языке',
  })
  title_en: string | null;
}
