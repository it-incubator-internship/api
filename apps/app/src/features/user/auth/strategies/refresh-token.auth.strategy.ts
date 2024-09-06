import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { SessionRepository } from '../repository/session.repository';
import { secondToMillisecond } from '../../../../common/constants/constants';
import { ConfigurationType } from '../../../../common/settings/configuration';
import { EntityEnum } from '../../../../../../common/repository/base.repository';

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
    const session = await this.sessionRepository.findUniqueOne({
      modelName: EntityEnum.session,
      conditions: { deviceUuid: payload.deviceUuid },
    });

    if (!session) {
      return null;
    }

    if (session.lastActiveDate.getTime() !== new Date(payload.iat * secondToMillisecond).getTime()) {
      return null;
    }

    return { userId: payload.userId, deviceUuid: payload.deviceUuid };
  }
}
