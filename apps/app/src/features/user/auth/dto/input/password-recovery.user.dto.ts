import { IsNotEmpty, IsString } from 'class-validator';

import { Trim } from '../../../../../../../common/decorators/trim.decorator';
import { RecaptchaTokenApiProperty } from '../../decorators/swagger/password-recovery/password-recovery.input';

import { EmailInputModel } from './email.user.dto';

export class PasswordRecoveryInputModel extends EmailInputModel {
  @RecaptchaTokenApiProperty()
  @IsString()
  @Trim()
  @IsNotEmpty()
  recaptchaToken: string;
}
