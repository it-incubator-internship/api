import { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Ip, Post, Req, Res, UseGuards } from '@nestjs/common';

import { RegistrationUserInputModel } from '../dto/input/registration.user.dto';
import { CodeInputModel } from '../dto/input/confirmation-code.user.dto';
import { NewPasswordInputModel } from '../dto/input/new-password.user.dto';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { UserRegistrationOutputDto } from '../dto/output/registratio.output.dto';
import { UserRegitsrationSwagger } from '../decorators/swagger/user-registration/user-regitsration.swagger.decorator';
import { RegistrationUserCommand } from '../application/command/registrarion.user.command';
import { RegistrationEmailResendingCommand } from '../application/command/registration-email-resending.user.command';
import { RegistrationConfirmationCommand } from '../application/command/registration-confirmation.user.command';
import { LoginUserCommand } from '../application/command/login.user.command';
import { LogoutUserCommand } from '../application/command/logout.user.command';
import { PasswordRecoveryCommand } from '../application/command/password-recovery.user.command';
import { SetNewPasswordCommand } from '../application/command/set-new-password.user.command';
import { LocalAuthGuard } from '../guards/local.auth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.auth.guard';
import { RefreshTokenInformation } from '../decorators/controller/refresh.token.information';
import { UserIdFromRequest } from '../decorators/controller/userIdFromRequest';
import { RefreshTokenCommand } from '../application/command/refresh-token.command';
import { RegistrationEmailResendingSwagger } from '../decorators/swagger/registration-email-resending/registration-email-resending.swagger.decorator';
import { RegistrationConfirmationSwagger } from '../decorators/swagger/registration-confirmation/registration-confirmation.swagger.decorator';
import { PasswordRecoverySwagger } from '../decorators/swagger/password-recovery/password-recovery.swagger.decorator';
import { NewPasswordSwagger } from '../decorators/swagger/new-password/new-password.swagger.decorator';
import { LoginSwagger } from '../decorators/swagger/login/login.swagger.decorator';
import { RefreshTokenSwagger } from '../decorators/swagger/refresh-token/refresh-token.swagger.decorator';
import { LogoutSwagger } from '../decorators/swagger/logout/logout.swagger.decorator';
import { UserQueryRepository } from '../../user/repository/user.query.repository';
import { JwtAuthGuard } from '../guards/jwt.auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private userRepository: UserQueryRepository,
  ) {}

  @Post('registration')
  @UserRegitsrationSwagger()
  async registration(@Body() inputModel: RegistrationUserInputModel): Promise<UserRegistrationOutputDto> {
    const result = await this.commandBus.execute(new RegistrationUserCommand(inputModel));

    if (!result.isSuccess) throw result.error;

    return { email: inputModel.email };
  }

  @Post('registration-email-resending')
  @RegistrationEmailResendingSwagger()
  async registrationEmailResending(@Body() inputModel: EmailInputModel): Promise<UserRegistrationOutputDto> {
    const result = await this.commandBus.execute(new RegistrationEmailResendingCommand(inputModel));

    if (!result.isSuccess) throw result.error;

    return { email: inputModel.email };
  }

  @Post('registration-confirmation')
  @RegistrationConfirmationSwagger()
  async registrationConfirmation(@Body() inputModel: CodeInputModel) {
    const result = await this.commandBus.execute(new RegistrationConfirmationCommand(inputModel));

    if (!result.isSuccess) throw result.error;
  }

  @Post('password-recovery')
  @PasswordRecoverySwagger()
  async passwordRecovery(@Body() inputModel: EmailInputModel) {
    const result = await this.commandBus.execute(new PasswordRecoveryCommand(inputModel));

    if (!result.isSuccess) throw result.error;

    return { email: inputModel.email };
  }

  @Post('new-password')
  @NewPasswordSwagger()
  async setNewPassword(@Body() inputModel: NewPasswordInputModel) {
    const result = await this.commandBus.execute(new SetNewPasswordCommand(inputModel));

    if (!result.isSuccess) throw result.error;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @LoginSwagger()
  async login(
    @Ip() ipAddress: string,
    @UserIdFromRequest() userInfo: { userId: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.commandBus.execute(
      new LoginUserCommand({ ipAddress, userAgent, userId: userInfo.userId }),
    );

    if (!result.isSuccess) throw result.error;
    //TODO указать в куки куда она должна приходить
    res.cookie('refreshToken', result.value.refreshToken, { httpOnly: true, secure: true });

    return { accessToken: result.value.accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @RefreshTokenSwagger()
  async refreshToken(
    @RefreshTokenInformation() userInfo: { userId: string; deviceUuid: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.commandBus.execute(
      new RefreshTokenCommand({ userId: userInfo.userId, deviceUuid: userInfo.deviceUuid }),
    );

    if (!result.isSuccess) throw result.error;

    res.cookie('refreshToken', result.value.refreshToken, { httpOnly: true, secure: true });

    return { accessToken: result.value.accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @LogoutSwagger()
  async logout(
    @RefreshTokenInformation() userInfo: { userId: string; deviceUuid: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.commandBus.execute(
      new LogoutUserCommand({ userId: userInfo.userId, deviceUuid: userInfo.deviceUuid }),
    );

    if (!result.isSuccess) throw result.error;

    res.clearCookie('refreshToken');

    return;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getInformationAboutCerruntUser(
    @UserIdFromRequest() userInfo: { userId: string },
  )/*:*/ {
    console.log('userInfo in auth controller (getInformationAboutCerruntUser):', userInfo);
    const user = await this.userRepository.findUserById({ id: userInfo.userId });
    console.log('user in auth controller (getInformationAboutCerruntUser):', user);

    if (!user) {
      console.log('I am teapod');
    }

    return {
      email: user!.email,
      userName: user!.name,
      userId: user!.id,
    };
  }
}
