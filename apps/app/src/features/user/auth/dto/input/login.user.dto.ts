import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

import { Trim } from '../../../../../../../common/decorators/trim.decorator';

import { EmailInputModel } from './email.user.dto';

export class LoginUserInputModel extends EmailInputModel {
  @IsString()
  @Trim()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).*$/)
  @IsNotEmpty()
  password: string;
}
