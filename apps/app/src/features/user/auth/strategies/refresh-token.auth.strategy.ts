import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from 'apps/app/src/common/settings/configuration';

import { SessionRepository } from '../repository/session.repository';
import { secondToMillisecond } from '../../../../../../app/src/common/constants/constants';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    const jwtSetting = configService.get('jwtSetting', { infer: true });
    const refreshSecretKey = jwtSetting.refreshTokenSecret as string;

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: refreshSecretKey,
    });
  }

  async validate(payload: any) {
    const session = await this.sessionRepository.findSessionByDeviceUuid({ deviceUuid: payload.deviceUuid });

    if (!session) {
      return null;
    }

    if (session.lastActiveDate.getTime() !== new Date(payload.iat * secondToMillisecond).getTime()) {
      return null;
    }

    return { userId: payload.userId, deviceUuid: payload.deviceUuid };
  }
}
