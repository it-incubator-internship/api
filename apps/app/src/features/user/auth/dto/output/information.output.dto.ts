import { ApiProperty } from '@nestjs/swagger';

export class AuthMeOutput {
  @ApiProperty({
    example: 'someemail@mail.ru',
  })
  email: string;
  @ApiProperty({
    example: 'someusername',
  })
  userName: string;
  @ApiProperty({
    example: 'c6375398-c870-4df6-9f05-2f920d23d7ac',
  })
  userId: string;
}
