// import { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ApiExcludeController /*, ApiTags */ } from '@nestjs/swagger';
import { Controller, Get, /* Ip, */ Req, /* Res, */ UseGuards } from '@nestjs/common';

import { GoogleAuthCommand } from '../application/command/google.auth.command';
import { GoogleOauthGuard } from '../guards/google.auth.guard';
import { GoogleAuthInformation } from '../decorators/controller/google.auth.information';

@ApiExcludeController()
@Controller('auth/google')
export class AuthGoogleController {
  constructor(private commandBus: CommandBus) {}

  @Get()
  @UseGuards(GoogleOauthGuard)
  async googleAuth(@Req() req) {
    console.log('console.log in auth google controller (googleAuth)');
    return;
  }

  @Get('redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    // @Ip() ipAddress: string,
    @GoogleAuthInformation() userInfo: { googleId: string; email: string; emailVerification: boolean },
    // @Req() req: Request,
    // @Res({ passthrough: true }) res: Response,
  ) {
    console.log('console.log in auth google controller (googleAuthRedirect)');

    // // определение ipAddress
    // console.log('ipAddress in auth google controller (googleAuthRedirect):', ipAddress);

    console.log('userInfo in auth google controller (googleAuthRedirect):', userInfo);

    // // определение userAgent
    // const userAgent = req.headers['user-agent'] || 'unknown';
    // console.log('userAgent in auth google controller (googleAuthRedirect):', userAgent);

    const result = await this.commandBus.execute(
      new GoogleAuthCommand({
        googleId: userInfo.googleId,
        email: userInfo.email,
        emailValidation: userInfo.emailVerification,
        // ipAddress,
        // userAgent,
      }),
    );
    console.log('result in auth google controller (googleAuthRedirect):', result);

    if (!result.isSuccess) throw result.error;
    // //TODO указать в куки куда она должна приходить
    // res.cookie('refreshToken', result.value.refreshToken, { httpOnly: true, secure: true });

    // return { accessToken: result.value.accessToken };
  }
}
