import { Trim } from "apps/common/decorators/trim.decorator";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class EmailInputModelDto {   // применяется при запросе confirmationCode и recoveryCode
    @IsString()
    @Trim()
    @IsEmail()
    @IsNotEmpty()
    email: string;
}