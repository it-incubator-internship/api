import { Trim } from '../../../../../../../common/decorators/trim.decorator';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { EmailApiProperty } from '../../decorators/swagger/common/email.input';

// применяется при запросе confirmationCode и recoveryCode
export class EmailInputModel {
  @EmailApiProperty()
  @IsString()
  @Trim()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
