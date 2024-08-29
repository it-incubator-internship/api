import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: '145106821045-oud30j9s8m88l6icdc536vqhoc3k7un7.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/api/v1/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    console.log('console.log in google strategy (validate)');
    console.log('profile in google strategy (validate):', profile);

    const { sub, email, email_verified } = profile;
    console.log('sub in google strategy (validate):', sub);
    console.log('email in google strategy (validate):', email);
    console.log('email_verified in google strategy (validate):', email_verified);

    if (email && !email_verified) {
      return false;
    }

    const user = {
      googleId: sub,
      email,
      emailVerification: email_verified,
    };
    console.log('user in google strategy (validate):', user);

    return user;
  }
}
