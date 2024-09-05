import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Ip, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { OauthService } from '../application/service/oauth.service';
import { GithubAuthSwagger } from '../decorators/swagger/github-auth/github-auth.swagger.decorator';
import { GithubAuthHookSwagger } from '../decorators/swagger/github-auth-hook/github-auth-hook.swagger.decorator';

import { GithubOauthGuard } from './passport/github/github-oauth.guard';
import { GithubData } from './passport/github/github-oauth.strategy';

@ApiTags('auth/github')
@Controller('auth/github')
export class GithubOauthController {
  constructor(private readonly oathService: OauthService) {}

  @Get('')
  @GithubAuthSwagger()
  @UseGuards(GithubOauthGuard)
  async githubAuth() {}

  @Get('callback')
  @GithubAuthHookSwagger()
  @UseGuards(GithubOauthGuard)
  async githubAuthCallback(@Ip() ipAddress: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const githubData = req!.user as GithubData;
    const userAgent = req.headers['user-agent'] || 'unknown';

    const loginData = {
      userAgent,
      ip: ipAddress,
    };

    const githubRegistrationData = {
      githubId: githubData.id,
      email: githubData.email,
      login: githubData.displayName,
    };

    const result = await this.oathService.githubAuth(loginData, githubRegistrationData);

    if (!result.isSuccess) throw result.error;
    //TODO указать в куки куда она должна приходить
    res.cookie('refreshToken', result.value.refreshToken, { httpOnly: true, secure: true, sameSite: 'none' });

    return { accessToken: result.value.accessToken };
  }
}
