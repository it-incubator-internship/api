import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

import { Trim } from '../../../../../../../common/decorators/trim.decorator';

// применяется при отправке confirmationCode
export class CodeInputModel {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @IsJWT()
  code: string;
}
