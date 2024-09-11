import { ApiProperty } from '@nestjs/swagger';

export class UserProfileOutputDto {
  @ApiProperty({
    example: 'someusername',
  })
  userName: string;
  @ApiProperty({
    example: 'somefirstname',
    nullable: true,
  })
  firstName?: string;
  @ApiProperty({
    example: 'somelastname',
    nullable: true,
  })
  lastName?: string;
  @ApiProperty({
    example: '1997-07-07T00:00:00.000Z',
    nullable: true,
  })
  dateOfBirth?: Date;
  @ApiProperty({
    example: 'somecountry',
    nullable: true,
  })
  country?: string;
  @ApiProperty({
    example: 'somecity',
    nullable: true,
  })
  city?: string;
  @ApiProperty({
    example: 'some information about me',
    nullable: true,
  })
  aboutMe?: string;
}
