import { ApiProperty } from '@nestjs/swagger';

export class UserLoginOutputDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTg1IiwiaWF0IjoxNzIyOTQ4Mjc1LCJleHAiOjE3MjI5NDg3NzV9.cCXNTm8FDW_GvuuVRHC9rVYgiz0s5GXhcrzSiQHmSBA',
  })
  accessToken: string;
}
