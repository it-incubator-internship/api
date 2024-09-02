import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { LoginUserCommand } from '../command/login.user.command';
import { GoogleAuthCommand } from '../command/oauth/google.auth.command';
import { GithubOauthCommand } from '../command/oauth/github-oauth.command';

export class LoginData {
  ip: string;
  userAgent: string;
  userId: string;
}

export class GoogleRegistrationData {
  googleId: string;
  email: string;
}

export class GithubRegistrationData {
  githubId: string;
  email: string | null;
  login: string;
}

@Injectable()
export class OauthService {
  constructor(private readonly commandBus: CommandBus) {}

  async GoogleAuth(
    loginData: Omit<LoginData, 'userId'>,
    googleRegistrationData: GoogleRegistrationData,
  ): Promise<ObjResult<{ accessToken: string; refreshToken: string }>> {
    const oauthResult = await this.commandBus.execute<NonNullable<unknown>, ObjResult<{ userId: string }>>(
      new GoogleAuthCommand(googleRegistrationData),
    );
    return this.login({ ...loginData, userId: oauthResult.value.userId });
  }

  async githubAuth(
    loginData: Omit<LoginData, 'userId'>,
    githubRegistrationData: GithubRegistrationData,
  ): Promise<ObjResult<{ accessToken: string; refreshToken: string }>> {
    const oauthResult = await this.commandBus.execute<NonNullable<unknown>, ObjResult<{ userId: string }>>(
      new GithubOauthCommand({
        id: githubRegistrationData.githubId,
        displayName: githubRegistrationData.login,
        email: githubRegistrationData.email,
      }),
    );
    return this.login({ ...loginData, userId: oauthResult.value.userId });
  }

  private async login(loginData: LoginData): Promise<ObjResult<{ accessToken: string; refreshToken: string }>> {
    return this.commandBus.execute<LoginUserCommand, ObjResult<{ accessToken: string; refreshToken: string }>>(
      new LoginUserCommand({
        ipAddress: loginData.ip,
        userAgent: loginData.userAgent,
        userId: loginData.userId,
      }),
    );
  }
}
