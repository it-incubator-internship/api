import { IsString, Length, Matches } from "class-validator";
import { EmailInputModelDto } from "./email.user.dto";
import { Trim } from "apps/common/decorators/trim.decorator";

export class LoginUserInputModelDto extends EmailInputModelDto {
    @IsString()
    @Trim()
    @Length(6, 20)
    @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-.\/:\;<=>?@\[\\\]^_`{|}~]).{8,}$/)
    password: string;
}