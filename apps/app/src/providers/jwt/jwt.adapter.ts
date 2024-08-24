import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { BadRequestError } from '../../../../common/utils/result/custom-error';
import { ObjResult } from '../../../../common/utils/result/object-result';
import { ConfigurationType } from '../../common/settings/configuration';

@Injectable()
export class JwtAdapter {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {}

  async createConfirmationCode({ email }: { email: string }) {
    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

    // создание confirmationCode
    const confirmationCodePayload = { email };
    const confirmationCodeSecret = jwtConfiguration.confirmationCodeSecret as string;
    const confirmationCodeLifeTime = jwtConfiguration.confirmationCodeLifeTime as string;
    const confirmationCode = await this.jwtService.signAsync(confirmationCodePayload, {
      secret: confirmationCodeSecret,
      expiresIn: confirmationCodeLifeTime,
    });

    return { confirmationCode };
  }

  async createRecoveryCode({ email }: { email: string }) {
    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

    // создание recoveryCode
    const recoveryCodePayload = { email };
    const recoveryCodeSecret = jwtConfiguration.recoveryCodeSecret as string;
    const recoveryCodeLifeTime = jwtConfiguration.recoveryCodeLifeTime as string;
    const recoveryCode = this.jwtService.sign(recoveryCodePayload, {
      secret: recoveryCodeSecret,
      expiresIn: recoveryCodeLifeTime,
    });

    return { recoveryCode };
  }

  async createAccessAndRefreshTokens({ userId, deviceUuid }: { userId: string; deviceUuid: string }) {
    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

    // создание accessToken
    const accessTokenPayload = { userId };
    const accessTokenSecret = jwtConfiguration.accessTokenSecret as string;
    const accessTokenLifeTime = jwtConfiguration.accessTokenLifeTime as string;
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: accessTokenSecret,
      expiresIn: accessTokenLifeTime,
    });

    // создание refreshToken
    const refreshTokenPayload = { userId, deviceUuid };
    const refreshTokenSecret = jwtConfiguration.refreshTokenSecret as string;
    const refreshTokenLifeTime = jwtConfiguration.refreshTokenLifeTime as string;
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenLifeTime,
    });

    const payload = await this.jwtService.decode(refreshToken);

    return { accessToken, refreshToken, payload };
  }

  async verifyConfirmationCode({ confirmationCode }: { confirmationCode: string }) {
    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
    const confirmationCodeSecret = jwtConfiguration.confirmationCodeSecret as string;

    try {
      await this.jwtService.verifyAsync(confirmationCode, { secret: confirmationCodeSecret });
    } catch (e) {
      return ObjResult.Err(
        new BadRequestError('Confirmation code is expired', [
          { message: 'Confirmation code is expired', field: 'code' },
        ]),
      );
    }
  }

  async verifyRecoveryCode({ recoveryCode }: { recoveryCode: string }) {
    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
    const recoveryCodeSecret = jwtConfiguration.recoveryCodeSecret as string;

    try {
      await this.jwtService.verifyAsync(recoveryCode, { secret: recoveryCodeSecret });
    } catch (e) {
      return ObjResult.Err(
        new BadRequestError('Recovery code is expired', [{ message: 'Recovery code is expired', field: 'code' }]),
      );
    }
  }
}
