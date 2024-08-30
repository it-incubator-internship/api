import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { ConfigurationType } from '../../../../../../app/src/common/settings/configuration';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<ConfigurationType, true>) {
    const jwtSetting = configService.get('jwtSetting', { infer: true });
    const accessSecretKey = jwtSetting.accessTokenSecret as string;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessSecretKey,
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId };
  }
}
