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
