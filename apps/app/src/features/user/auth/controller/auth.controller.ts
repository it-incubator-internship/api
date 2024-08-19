import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { RegistrationUserInputModel } from '../dto/input/registration.user.dto';
import { LoginUserInputModel } from '../dto/input/login.user.dto';
import { CodeInputModel } from '../dto/input/confirmation-code.user.dto';
import { NewPasswordInputModel } from '../dto/input/new-password.user.dto';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { RegistrationUserCommand } from '../use.cases/registrarion.user.use.case';
import { RegistrationEmailResendingCommand } from '../use.cases/registration-email-resending.user.use.case';
import { RegistrationConfirmationCommand } from '../use.cases/registration-confirmation.user.use.case';
import { LoginUserCommand } from '../use.cases/login.user.use.case';
import { LogoutUserCommand } from '../use.cases/logout.user.use.case';
import { PasswordRecoveryCommand } from '../use.cases/password-recovery.user.use.case';
import { SetNewPasswordCommand } from '../use.cases/set-new-password.user.use.case';
import { UserRegistrationOutputDto } from '../dto/output/registratio.output.dto';
import { UserRegitsrationSwagger } from '../decorators/swagger/user-registration/user-regitsration.swagger.decorator';

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
    console.log('inputModel in auth controller (registrationEmailResending):', inputModel);
    const result = await this.commandBus.execute(new RegistrationEmailResendingCommand(inputModel));
    console.log('result in auth controller (registrationEmailResending):', result);
    if (!result.isSuccess) throw result.error;
    return { email: inputModel.email };
  }

  @Post('registration-confirmation')
  async registrationConfirmation(@Body() inputModel: CodeInputModel) {
    console.log('inputModel in auth controller (registrationConfirmation):', inputModel);
    const result = await this.commandBus.execute(new RegistrationConfirmationCommand(inputModel));
    console.log('result in auth controller (registrationConfirmation):', result);
    if (!result.isSuccess) throw result.error;
  }

  @Post('login')
  async login(@Body() inputModel: LoginUserInputModel) {
    const result = await this.commandBus.execute(new LoginUserCommand(inputModel));
  }

  @Post('logout')
  async logout() {
    const result = await this.commandBus.execute(new LogoutUserCommand());
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
}
