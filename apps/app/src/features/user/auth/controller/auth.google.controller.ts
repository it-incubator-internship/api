// import { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, /* Ip, */ Post /* , Req, Res, UseGuards */ } from '@nestjs/common';

import { RegistrationUserInputModel } from '../dto/input/registration.user.dto';
// import { CodeInputModel } from '../dto/input/confirmation-code.user.dto';
// import { NewPasswordInputModel } from '../dto/input/new-password.user.dto';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { UserRegistrationOutputDto } from '../dto/output/registratio.output.dto';
import { UserRegitsrationSwagger } from '../decorators/swagger/user-registration/user-regitsration.swagger.decorator';
import { RegistrationUserCommand } from '../application/command/registrarion.user.command';
import { RegistrationEmailResendingCommand } from '../application/command/registration-email-resending.user.command';
// import { RegistrationConfirmationCommand } from '../application/command/registration-confirmation.user.command';
// import { LoginUserCommand } from '../application/command/login.user.command';
// import { LogoutUserCommand } from '../application/command/logout.user.command';
// import { PasswordRecoveryCommand } from '../application/command/password-recovery.user.command';
// import { SetNewPasswordCommand } from '../application/command/set-new-password.user.command';
// import { LocalAuthGuard } from '../guards/local.auth.guard';
// import { RefreshTokenGuard } from '../guards/refresh-token.auth.guard';
// import { RefreshTokenInformation } from '../decorators/controller/refresh.token.information';
// import { UserIdFromRequest } from '../decorators/controller/userIdFromRequest';
// import { RefreshTokenCommand } from '../application/command/refresh-token.command';

@ApiTags('auth')
@Controller('auth')
export class AuthGoogleController {
  constructor(private commandBus: CommandBus) {}

  @Post('registration')
  @UserRegitsrationSwagger()
  async registration(@Body() inputModel: RegistrationUserInputModel): Promise<UserRegistrationOutputDto> {
    const result = await this.commandBus.execute(new RegistrationUserCommand(inputModel));

    if (!result.isSuccess) throw result.error;

    return { email: inputModel.email };
  }

  @Post('registration-email-resending')
  async registrationEmailResending(@Body() inputModel: EmailInputModel): Promise<UserRegistrationOutputDto> {
    const result = await this.commandBus.execute(new RegistrationEmailResendingCommand(inputModel));

    if (!result.isSuccess) throw result.error;

    return { email: inputModel.email };
  }
}
