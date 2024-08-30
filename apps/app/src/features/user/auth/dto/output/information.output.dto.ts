import { ApiProperty } from '@nestjs/swagger';

export class UserInformationOutputDto {
  @ApiProperty({
    example: 'someemail@mail.ru',
  })
  email: string;
  @ApiProperty({
    example: 'someusername',
  })
  name: string;
  @ApiProperty({
    example: 'c6375398-c870-4df6-9f05-2f920d23d7ac',
  })
  id: string;
}
