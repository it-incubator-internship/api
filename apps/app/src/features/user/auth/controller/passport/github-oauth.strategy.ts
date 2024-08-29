import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

export class GithubData {
  id: string;
  displayName: string;
  email: string | null;
}

@Injectable()
export class GithubOauthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly httpService: HttpService) {
    //TODO вынести в константы
    super({
      clientID: 'Ov23liPXUAuNE4Qn65BU',
      clientSecret: '9da09759fffa95c8860b113ed7da349a501fba86',
      callbackURL: 'http://localhost:3000/api/v1/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile, ...args: any[]): Promise<GithubData> {
    // Первоначальная попытка получить email из профиля
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
