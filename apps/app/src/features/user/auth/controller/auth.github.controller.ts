import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Ip, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { OauthService } from '../application/service/oauth.service';

import { GithubOauthGuard } from './passport/github/github-oauth.guard';
import { GithubData } from './passport/github/github-oauth.strategy';

// @ApiTags('auth/github')
@ApiExcludeController()
@Controller('auth/github')
export class GithubOauthController {
  constructor(private readonly oathService: OauthService) {}

  @Get('')
  @UseGuards(GithubOauthGuard)
  async githubAuth() {}

  @Get('callback')
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
    res.cookie('refreshToken', result.value.refreshToken, { httpOnly: true, secure: true });

    return { accessToken: result.value.accessToken };
  }
}
