import { IsString, Length, Matches } from 'class-validator';

import { Trim } from '../../../../../../../common/decorators/trim.decorator';
import {
  passwordApiProperty,
  passwordConfirmationApiProperty,
} from '../../decorators/swagger/user-registration/user-registration.input';

import { CodeInputModel } from './confirmation-code.user.dto';

export class NewPasswordInputModel extends CodeInputModel {
  @passwordApiProperty()
  @IsString()
  @Trim()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).*$/)
  newPassword: string;

  @passwordConfirmationApiProperty()
  @IsString()
  @Trim()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).*$/)
  passwordConfirmation: string;
}
