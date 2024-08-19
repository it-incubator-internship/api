import { IsString, Length, Matches } from 'class-validator';
import { CodeInputModel } from './confirmation-code.user.dto';
import { Trim } from '../../../../../../../common/decorators/trim.decorator';

export class NewPasswordInputModel extends CodeInputModel {
  @IsString()
  @Trim()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).*$/)
  newPassword: string;

  @IsString()
  @Trim()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).*$/)
  passwordConfirmation: string;
}
