import { IsBoolean, IsString, Length, Matches } from 'class-validator';
import { EmailInputModel } from './email.user.dto';
import { Trim } from 'apps/common/decorators/trim.decorator';

export class RegistrationUserInputMode extends EmailInputModel {
  @IsString()
  @Trim()
  @Length(6, 30)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  userName: string;

  @IsString()
  @Trim()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).{8,}$/)
  password: string;

  @IsString()
  @Trim()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).{8,}$/)
  passwordConfirmation: string;

  @IsBoolean()
  isAgreement: boolean;
}
