// RegistrationUserInputModel.ts
import { IsBoolean, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../../../../common/decorators/trim.decorator';
import { EmailInputModel } from './email.user.dto';
import {
  isAgreementApiProperty,
  passwordApiProperty,
  passwordConfirmationApiProperty,
  userNameApiProperty,
} from '../../decorators/swagger/user-registration/user-registration.input';

export class RegistrationUserInputModel extends EmailInputModel {
  @userNameApiProperty()
  @IsString()
  @Trim()
  @Length(6, 30)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  userName: string;

  @passwordApiProperty()
  @IsString()
  @Trim()
  @Length(8, 20) // Исправлено с 6 на 8
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).{8,}$/)
  password: string;

  @passwordConfirmationApiProperty()
  @IsString()
  @Trim()
  @Length(8, 20) // Исправлено с 6 на 8
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).{8,}$/)
  passwordConfirmation: string;

  @isAgreementApiProperty()
  @IsBoolean()
  isAgreement: boolean;
}
