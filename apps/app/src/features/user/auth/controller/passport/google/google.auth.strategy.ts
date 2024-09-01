import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { ConfigService } from '@nestjs/config';

import { ConfigurationType } from '../../../../../../common/settings/configuration';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService<ConfigurationType, true>) {
    const googleAuthorizationSettings = configService.get('googleAuthorizationSettings', {
      infer: true,
    });

    super({
      clientID: googleAuthorizationSettings.clientID,
      clientSecret: googleAuthorizationSettings.clientSecret,
      callbackURL: googleAuthorizationSettings.callbackURL,
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { sub, email, email_verified } = profile;

    if (email && !email_verified) {
      return false;
    }

    const user = {
      googleId: sub,
      email,
      emailVerification: email_verified,
    };

    return user;
  }
}
