import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { ConfigurationType } from '../../../../../../common/settings/configuration';

export class GithubData {
  id: string;
  displayName: string;
  email: string | null;
}

@Injectable()
export class GithubOauthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    const githubSetting = configService.get('githubAuthorizationSettings', {
      infer: true,
    });
    super({
      clientID: githubSetting.clientID,
      clientSecret: githubSetting.clientSecret,
      callbackURL: githubSetting.callbackURL,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile, ...args: any[]): Promise<GithubData> {
    let email = profile.emails?.[0]?.value || null;

    // Если email не найден в профиле, запросим его через API GitHub
    if (!email) {
      const response = await lastValueFrom(
        this.httpService.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      const primaryEmail = response.data.find((emailObj: any) => emailObj.primary)?.email;
      email = primaryEmail || null;
    }

    return {
      id: profile.id,
      displayName: profile.displayName,
      email,
    };
  }
}
