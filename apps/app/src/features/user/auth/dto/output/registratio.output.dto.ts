import { ApiProperty } from '@nestjs/swagger';

export class UserRegistrationOutputDto {
  @ApiProperty({ example: 'someemail@mail.ru' })
  email: string;
}
