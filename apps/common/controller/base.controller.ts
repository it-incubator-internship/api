import { Body, Controller, Get, NotFoundException, Put } from '@nestjs/common';

import { BaseRepository, EntityEnum } from '../repository/base.repository';

@Controller('base')
export class BaseController {
  constructor(private baseRepository: BaseRepository) {}

  @Get('get/user/id')
  async getUserById(@Body() inputModel: { id: string }) {
    console.log('inputModel in base controller (getUserById):', inputModel);

    const searchResult = await this.baseRepository.findFirstOne({
      // modelName: 'user',
      modelName: EntityEnum.user,
      conditions: { id: inputModel.id },
    });
    console.log('searchResult in base controller (getUserById):', searchResult);

    if (!searchResult) throw new NotFoundException();

    return searchResult;
  }

  @Get('get/user/email')
  async getUserByEmail(@Body() inputModel: { email: string }) {
    console.log('inputModel in base controller (getUserByEmail):', inputModel);

    const searchResult = await this.baseRepository.findFirstOne({
      // modelName: 'user',
      modelName: EntityEnum.user,
      conditions: { email: inputModel.email },
    });
    console.log('searchResult in base controller (getUserByEmail):', searchResult);

    if (!searchResult) throw new NotFoundException();

    return searchResult;
  }

  @Get('get/user/name')
  async getUserByName(@Body() inputModel: { name: string }) {
    console.log('inputModel in base controller (getUserByName):', inputModel);

    const searchResult = await this.baseRepository.findFirstOne({
      // modelName: 'user',
      modelName: EntityEnum.user,
      conditions: { name: inputModel.name },
    });
    console.log('searchResult in base controller (getUserByName):', searchResult);

    if (!searchResult) throw new NotFoundException();

    return searchResult;
  }

  @Get('get/accountdata/profileid')
  async getAccountDataByProfileId(@Body() inputModel: { profileId: string }) {
    console.log('inputModel in base controller (getAccountDataByProfileId):', inputModel);

    const searchResult = await this.baseRepository.findFirstOne({
      // modelName: 'user',
      modelName: EntityEnum.accountData,
      conditions: { profileId: inputModel.profileId },
    });
    console.log('searchResult in base controller (getAccountDataByProfileId):', searchResult);

    if (!searchResult) throw new NotFoundException();

    return searchResult;
  }

  @Get('get/accountdata/googleid')
  async getAccountDataByGoogleId(@Body() inputModel: { googleId: string }) {
    console.log('inputModel in base controller (getAccountDataByGoogleId):', inputModel);

    const searchResult = await this.baseRepository.findFirstOne({
      // modelName: 'user',
      modelName: EntityEnum.accountData,
      conditions: { googleId: inputModel.googleId },
    });
    console.log('searchResult in base controller (getAccountDataByGoogleId):', searchResult);

    if (!searchResult) throw new NotFoundException();

    return searchResult;
  }

  @Put('put/user/name')
  async updateUserName(@Body() inputModel: { id: string; name: string }) {
    console.log('inputModel in base controller (updateUserName):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: 'user',
      conditions: { id: inputModel.id },
      data: { name: inputModel.name },
    });
    console.log('updatingResult in base controller (updateUserName):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/user/email')
  async updateUserEmail(@Body() inputModel: { id: string; email: string }) {
    console.log('inputModel in base controller (updateUserEmail):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: 'user',
      conditions: { id: inputModel.id },
      data: { email: inputModel.email },
    });
    console.log('updatingResult in base controller (updateUserEmail):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/user/all')
  async updateUserData(@Body() inputModel: { id: string; name: string; email: string }) {
    console.log('inputModel in base controller (updateUserData):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: 'user',
      conditions: { id: inputModel.id },
      data: {
        name: inputModel.name,
        email: inputModel.email,
      },
    });
    console.log('updatingResult in base controller (updateUserData):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/accountdata/confirmationcode')
  async updateAccountDataConfirmationCode(@Body() inputModel: { id: string; confirmationCode: string }) {
    console.log('inputModel in base controller (updateAccountDataConfirmationCode):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: 'accountData',
      conditions: { profileId: inputModel.id },
      data: {
        confirmationCode: inputModel.confirmationCode,
      },
    });
    console.log('updatingResult in base controller (updatupdateAccountDataConfirmationCodeeUserData):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/accountdata/recoverycode')
  async updateAccountDataRecoveryCode(@Body() inputModel: { id: string; recoveryCode: string }) {
    console.log('inputModel in base controller (updateAccountDataRecoveryCode):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: 'accountData',
      conditions: { profileId: inputModel.id },
      data: {
        recoveryCode: inputModel.recoveryCode,
      },
    });
    console.log('updatingResult in base controller (updateAccountDataRecoveryCode):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/accountdata/googleid')
  async updateAccountDataGoogleId(@Body() inputModel: { id: string; googleId: string }) {
    console.log('inputModel in base controller (updateAccountDataGoogleId):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: 'accountData',
      conditions: { profileId: inputModel.id },
      data: {
        googleId: inputModel.googleId,
      },
    });
    console.log('updatingResult in base controller (updateAccountDataGoogleId):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/accountdata/githubid')
  async updateAccountDataGithubId(@Body() inputModel: { id: string; githubId: string }) {
    console.log('inputModel in base controller (updateAccountDataGithubId):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: 'accountData',
      conditions: { profileId: inputModel.id },
      data: {
        githubId: inputModel.githubId,
      },
    });
    console.log('updatingResult in base controller (updateAccountDataGithubId):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  @Put('put/accountdata/all')
  async updateAccountDataData(
    @Body()
    inputModel: {
      id: string;
      confirmationCode: string;
      recoveryCode: string;
      googleId: string;
      githubId: string;
    },
  ) {
    console.log('inputModel in base controller (updateAccountDataData):', inputModel);

    const updatingResult = await this.baseRepository.updateOne({
      modelName: 'accountData',
      conditions: { profileId: inputModel.id },
      data: {
        confirmationCode: inputModel.confirmationCode,
        recoveryCode: inputModel.recoveryCode,
        googleId: inputModel.googleId,
        githubId: inputModel.githubId,
      },
    });
    console.log('updatingResult in base controller (updateAccountDataData):', updatingResult);

    if (!updatingResult) throw new NotFoundException();

    return updatingResult;
  }

  // @Post('registration-email-resending')
  // @RegistrationEmailResendingSwagger()
  // async registrationEmailResending(@Body() inputModel: EmailInputModel): Promise<UserRegistrationOutputDto> {
  //   const result = await this.commandBus.execute(new RegistrationEmailResendingCommand(inputModel));

  //   if (!result.isSuccess) throw result.error;

  //   return { email: inputModel.email };
  // }

  // @Post('registration-confirmation')
  // @RegistrationConfirmationSwagger()
  // async registrationConfirmation(@Body() inputModel: CodeInputModel) {
  //   const result = await this.commandBus.execute(new RegistrationConfirmationCommand(inputModel));

  //   if (!result.isSuccess) throw result.error;
  // }

  // @UseGuards(RecaptchaAuthGuard)
  // @Post('password-recovery')
  // @PasswordRecoverySwagger()
  // async passwordRecovery(@Body() inputModel: PasswordRecoveryInputModel): Promise<UserRegistrationOutputDto> {
  //   const result = await this.commandBus.execute(new PasswordRecoveryCommand(inputModel));

  //   if (!result.isSuccess) throw result.error;

  //   return { email: inputModel.email };
  // }

  // @Post('new-password')
  // @NewPasswordSwagger()
  // async setNewPassword(@Body() inputModel: NewPasswordInputModel) {
  //   const result = await this.commandBus.execute(new SetNewPasswordCommand(inputModel));

  //   if (!result.isSuccess) throw result.error;
  // }

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // @LoginSwagger()
  // async login(
  //   @Ip() ipAddress: string,
  //   @UserIdFromRequest() userInfo: { userId: string },
  //   @Req() req: Request,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<AccessTokenOutput> {
  //   const userAgent = req.headers['user-agent'] || 'unknown';

  //   const result = await this.commandBus.execute(
  //     new LoginUserCommand({ ipAddress, userAgent, userId: userInfo.userId }),
  //   );

  //   if (!result.isSuccess) throw result.error;
  //   //TODO указать в куки куда она должна приходить
  //   res.cookie('refreshToken', result.value.refreshToken, { httpOnly: true, secure: true });

  //   return { accessToken: result.value.accessToken };
  // }

  // @UseGuards(RefreshTokenGuard)
  // @Post('refresh-token')
  // @RefreshTokenSwagger()
  // async refreshToken(
  //   @RefreshTokenInformation() userInfo: { userId: string; deviceUuid: string },
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<AccessTokenOutput> {
  //   const result = await this.commandBus.execute<RefreshTokenCommand, ObjResult<TokensPair>>(
  //     new RefreshTokenCommand({ userId: userInfo.userId, deviceUuid: userInfo.deviceUuid }),
  //   );

  //   if (!result.isSuccess) throw result.error;

  //   res.cookie('refreshToken', result.value.refreshToken, { httpOnly: true, secure: true });

  //   return { accessToken: result.value.accessToken };
  // }

  // @UseGuards(RefreshTokenGuard)
  // @Post('logout')
  // @LogoutSwagger()
  // async logout(
  //   @RefreshTokenInformation() userInfo: { userId: string; deviceUuid: string },
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   const result = await this.commandBus.execute(
  //     new LogoutUserCommand({ userId: userInfo.userId, deviceUuid: userInfo.deviceUuid }),
  //   );

  //   if (!result.isSuccess) throw result.error;

  //   res.clearCookie('refreshToken');

  //   return;
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // @MeSwagger()
  // async getInformationAboutCerruntUser(@UserIdFromRequest() userInfo: { userId: string }): Promise<AuthMeOutput> {
  //   const user = await this.userRepository.findUserMeInformation({ id: userInfo.userId });

  //   if (!user) throw new NotFoundException();

  //   return user;
  // }
}
