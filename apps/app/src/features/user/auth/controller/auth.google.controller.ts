// import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Ip, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { GoogleAuthInformation } from '../decorators/controller/google.auth.information';
import { OauthService } from '../application/service/oauth.service';
import { GoogleAuthSwagger } from '../decorators/swagger/google-auth/google-auth.swagger.decorator';
import { GoogleAuthHookSwagger } from '../decorators/swagger/google-auth-hook/google-auth-hook.swagger.decorator';

import { GoogleOauthGuard } from './passport/google/google.auth.guard';

@ApiTags('auth/google')
@Controller('auth/google')
export class AuthGoogleController {
  constructor(private readonly oathService: OauthService) {}

  @Get()
  @GoogleAuthSwagger()
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {}

  @Get('redirect')
  @GoogleAuthHookSwagger()
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @Ip() ipAddress: string,
    @GoogleAuthInformation() userInfo: { googleId: string; email: string; emailVerification: boolean },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';

    const loginData = {
      userAgent,
      ip: ipAddress,
    };

    const googleRegistrationData = {
      googleId: userInfo.googleId,
      email: userInfo.email,
    };

    const result = await this.oathService.GoogleAuth(loginData, googleRegistrationData);

    if (!result.isSuccess) throw result.error;

    res.cookie('refreshToken', result.value.refreshToken, { httpOnly: true, secure: true });

    return { accessToken: result.value.accessToken };
  }
}
