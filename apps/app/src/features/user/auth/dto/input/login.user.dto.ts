import { IsString, Length, Matches } from 'class-validator';
import { EmailInputModel } from './email.user.dto';
import { Trim } from 'apps/common/decorators/trim.decorator';

export class LoginUserInputModel extends EmailInputModel {
  @IsString()
  @Trim()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).{8,}$/)
  password: string;
}