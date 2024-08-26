import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { GithubOauthCommand } from '../application/command/oauth/github-oauth.command';

import { GithubOauthGuard } from './passport/github-oauth.guard';
import { GithubData } from './passport/github-oauth.strategy';

// @ApiTags('auth/github')
@ApiExcludeController()
@Controller('auth/github')
export class GithubOauthController {
  constructor(private commandBus: CommandBus) {}

  @Get('')
  @UseGuards(GithubOauthGuard)
  async githubAuth() {}

  @Get('callback')
  @UseGuards(GithubOauthGuard)
  async githubAuthCallback(@Req() req: Request) {
    const githubData = req!.user as GithubData;
    console.log(githubData);

    await this.commandBus.execute(new GithubOauthCommand(githubData));
  }
}
