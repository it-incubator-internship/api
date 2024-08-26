import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';

export class GithubData {
  id: string;
  displayName: string;
}

@Injectable()
export class GithubOauthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    //TODO конфиг
    super({
      clientID: 'Ov23liPXUAuNE4Qn65BU',
      clientSecret: '9da09759fffa95c8860b113ed7da349a501fba86',
      callbackURL: 'http://localhost:3000/api-v1/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile, ...args: any[]): Promise<GithubData> {
    return {
      id: profile.id,
      displayName: profile.displayName,
    };
  }
}
