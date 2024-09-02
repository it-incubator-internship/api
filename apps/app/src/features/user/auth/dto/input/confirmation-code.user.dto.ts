import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

import { Trim } from '../../../../../../../common/decorators/trim.decorator';
import { ConfirmationCodeApiProperty } from '../../decorators/swagger/registration-email-resending/confirmation-code.input';

// применяется при отправке confirmationCode
export class CodeInputModel {
  @ConfirmationCodeApiProperty()
  @IsString()
  @Trim()
  @IsNotEmpty()
  @IsJWT()
  code: string;
}
