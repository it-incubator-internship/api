// RegistrationUserInputModel.ts
import { IsBoolean, IsString, Length, Matches } from 'class-validator';

import {
  isAgreementApiProperty,
  passwordApiProperty,
  passwordConfirmationApiProperty,
  userNameApiProperty,
} from '../../decorators/swagger/user-registration/user-registration.input';
import { Trim } from '../../../../../../../common/decorators/trim.decorator';

import { EmailInputModel } from './email.user.dto';

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
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).*$/)
  password: string;

  @passwordConfirmationApiProperty()
  @IsString()
  @Trim()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).*$/)
  passwordConfirmation: string;

  @isAgreementApiProperty()
  @IsBoolean()
  isAgreement: boolean;
}
