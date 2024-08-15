import { ApiProperty } from '@nestjs/swagger';

class BadReqField {
  @ApiProperty({ description: 'причина', example: 'userName must be longer than or equal to 6 characters' })
  'message': string;
  @ApiProperty({ description: 'поле вызвавшее ошибку', example: 'userName' })
  'field': string;
}

export class BasicBadRequestOutputType {
  @ApiProperty({ description: 'Врремя ошибки в IsoString', example: '2024-08-15T20:12:27.118Z' })
  'timestamp': string;

  @ApiProperty({ description: 'эндпнойт с ошибкой', example: '/api-v1/auth/registration' })
  'path': string;

  @ApiProperty({ type: () => [BadReqField] })
  'fields': BadReqField[];
}
