import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { EmailApiProperty } from '../../decorators/swagger/common/email.input';
import { Trim } from '../../../../../../../common/decorators/trim.decorator';

// применяется при запросе confirmationCode и recoveryCode
export class EmailInputModel {
  @EmailApiProperty()
  @IsString()
  @Trim()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
