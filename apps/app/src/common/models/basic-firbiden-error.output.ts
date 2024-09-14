import { ApiProperty } from '@nestjs/swagger';

export class BasicForbidenErrorOutput {
  @ApiProperty({ description: 'Время ошибки в IsoString', example: '2024-08-15T20:12:27.118Z' })
  timestamp: string;

  @ApiProperty({ description: 'путь', example: '/api-v1/auth/registration' })
  path: string;

  @ApiProperty({ description: 'причина', example: 'userName must be longer than or equal to 6 characters' })
  message: string;
}
