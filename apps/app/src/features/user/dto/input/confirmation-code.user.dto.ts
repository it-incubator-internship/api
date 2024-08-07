import { Trim } from "apps/common/decorators/trim.decorator";
import { IsNotEmpty, IsString } from "class-validator";

export class CodeInputModelDto {   // применяется при отправке confirmationCode
    @IsString()
    @Trim()
    @IsNotEmpty()
    code: string;
}