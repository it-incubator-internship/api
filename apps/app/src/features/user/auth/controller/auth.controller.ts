import { Body, Controller, Ip, Post, Req, Res, UseGuards } from '@nestjs/common';
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
import { LocalAuthGuard } from '../guards/local.auth.guard';

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

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
  @Ip() ipAddress: string,
  @Body() inputModel: LoginUserInputModel,
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response) {
    console.log('ipAddress in auth controller (login):', ipAddress);
    console.log('inputModel in auth controller (login):', inputModel);

    const userAgent = req.headers['user-agent']
    console.log('userAgent in auth controller (login):', userAgent);

    const result = await this.commandBus.execute(new LoginUserCommand({email: inputModel.email, ipAddress, userAgent}));
    console.log('result in auth controller (login):', result);
    if (!result.isSuccess) throw result.error;

    // res.cookie('refreshToken', result.refreshToken, {httpOnly: true, secure: true,})

    return  {accessToken: result.accessToken}
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
