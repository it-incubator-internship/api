import { ApiProperty } from '@nestjs/swagger';

//TODO переименовать
export class UserRegistrationOutputDto {
  @ApiProperty({ example: 'someemail@mail.ru' })
  email: string;
}
