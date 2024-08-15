import { Body, Controller, Post } from '@nestjs/common';
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
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { UserRegistrationOutputDto } from '../dto/output/registratio.output.dto';
import { UserRegitsrationSwagger } from '../decorators/swagger/user-registration/user-regitsration.swagger.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @Post('registration')
  @UserRegitsrationSwagger()
  async registration(@Body() inputModel: RegistrationUserInputModel): Promise<UserRegistrationOutputDto> {
    console.log('inputModel in auth controller:', inputModel);
    const result = await this.commandBus.execute(new RegistrationUserCommand(inputModel));
    console.log('result in auth controller:', result);
    console.log('result.isSuccess in auth controller:', result.isSuccess);
    console.log('result._isSuccess in auth controller:', result._isSuccess);

    if (!result._isSuccess) throw result._error;
    return { email: inputModel.email };
  }

  @Post('registration-email-resending')
  async registrationEmailResending(@Body() inputModel: EmailInputModel) {
    const result = await this.commandBus.execute(new RegistrationEmailResendingCommand(inputModel));
  }

  @Post('registration-confirmation')
  async registrationConfirmation(@Body() inputModel: CodeInputModel) {
    const result = await this.commandBus.execute(new RegistrationConfirmationCommand(inputModel));
  }

  @Post('login')
  async login(@Body() inputModel: LoginUserInputModel) {
    const result = await this.commandBus.execute(new LoginUserCommand(inputModel));
  }

  @Post('logout')
  async logout() {
    const result = await this.commandBus.execute(
      // нужно подумать над реализацией
      new LogoutUserCommand(),
    );
  }

  @Post('password-recovery')
  async passwordRecovery(@Body() inputModel: EmailInputModel) {
    const result = await this.commandBus.execute(new PasswordRecoveryCommand(inputModel));
  }

  @Post('new-password')
  async setNewPassword(@Body() inputModel: NewPasswordInputModel) {
    const result = await this.commandBus.execute(new SetNewPasswordCommand(inputModel));
  }
}
