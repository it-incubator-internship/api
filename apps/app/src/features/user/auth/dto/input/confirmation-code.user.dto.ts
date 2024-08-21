import { Trim } from '../../../../../../../common/decorators/trim.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

// применяется при отправке confirmationCode
export class CodeInputModel {
  @IsString()
  @Trim()
  @IsNotEmpty()
  code: string;
}
