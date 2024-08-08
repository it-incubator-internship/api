import { Trim } from 'apps/common/decorators/trim.decorator';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// применяется при запросе confirmationCode и recoveryCode
export class EmailInputModel {
  @IsString()
  @Trim()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
