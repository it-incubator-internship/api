import { ApiProperty } from '@nestjs/swagger';

export class UserRegistrationOutputDto {
  @ApiProperty({ example: 'FelixArgyle' })
  email: string;
}
