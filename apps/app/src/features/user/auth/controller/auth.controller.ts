import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { RegistrationUserInputModel } from '../dto/input/registration.user.dto';
import { LoginUserInputModel } from '../dto/input/login.user.dto';
import { CodeInputModel } from '../dto/input/confirmation-code.user.dto';
import { NewPasswordInputModel } from '../dto/input/new-password.user.dto';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { UserRegistrationOutputDto } from '../dto/output/registratio.output.dto';
import { UserRegitsrationSwagger } from '../decorators/swagger/user-registration/user-regitsration.swagger.decorator';
import { RegistrationUserCommand } from '../command/registrarion.user.command';
import { RegistrationEmailResendingCommand } from '../command/registration-email-resending.user.command';
import { RegistrationConfirmationCommand } from '../command/registration-confirmation.user.command';
import { LoginUserCommand } from '../command/login.user.command';
import { LogoutUserCommand } from '../command/logout.user.command';
import { PasswordRecoveryCommand } from '../command/password-recovery.user.command';
import { SetNewPasswordCommand } from '../command/set-new-password.user.command';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @Post('registration')
  @UserRegitsrationSwagger()
  async registration(@Body() inputModel: RegistrationUserInputModel): Promise<UserRegistrationOutputDto> {
    console.log('inputModel in auth controller (registration):', inputModel);
    const result = await this.commandBus.execute(new RegistrationUserCommand(inputModel));
    console.log('result in auth controller (registration):', result);

    if (!result.isSuccess) throw result.error;
    return { email: inputModel.email };
  }

  @Post('registration-email-resending')
  async registrationEmailResending(@Body() inputModel: EmailInputModel): Promise<UserRegistrationOutputDto> {
    const result = await this.commandBus.execute(new RegistrationEmailResendingCommand(inputModel));

    if (!result.isSuccess) throw result.error;

    return { email: inputModel.email };
  }

  @Post('registration-confirmation')
  async registrationConfirmation(@Body() inputModel: CodeInputModel) {
    const result = await this.commandBus.execute(new RegistrationConfirmationCommand(inputModel));

    if (!result.isSuccess) throw result.error;
  }

  @Post('password-recovery')
  async passwordRecovery(@Body() inputModel: EmailInputModel) {
    console.log('inputModel in auth controller (passwordRecovery):', inputModel);
    const result = await this.commandBus.execute(new PasswordRecoveryCommand(inputModel));
    console.log('result in auth controller (passwordRecovery):', result);
    if (!result.isSuccess) throw result.error;
    return { email: inputModel.email };
  }

  @Post('new-password')
  async setNewPassword(@Body() inputModel: NewPasswordInputModel) {
    console.log('inputModel in auth controller (setNewPassword):', inputModel);
    const result = await this.commandBus.execute(new SetNewPasswordCommand(inputModel));
    console.log('result in auth controller (setNewPassword):', result);
    if (!result.isSuccess) throw result.error;
  }

  @Post('login')
  async login(@Body() inputModel: LoginUserInputModel) {
    const result = await this.commandBus.execute(new LoginUserCommand(inputModel));
  }

  @Post('refresh-token')
  async refreshToken(/* @Body() inputModel: LoginUserInputModel */) {
    // const result = await this.commandBus.execute(new LoginUserCommand(inputModel));
  }

  @Post('logout')
  async logout() {
    const result = await this.commandBus.execute(new LogoutUserCommand());
  }
}
