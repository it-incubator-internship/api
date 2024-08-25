import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { BadRequestError } from '../../../../common/utils/result/custom-error';
import { ObjResult } from '../../../../common/utils/result/object-result';
import { ConfigurationType } from '../../common/settings/configuration';

@Injectable()
export class JwtAdapter {
  private readonly logger = new Logger(JwtAdapter.name);
  private readonly jwtConfiguration: ConfigurationType['jwtSetting'];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.jwtConfiguration = this.configService.get<ConfigurationType['jwtSetting']>('jwtSetting', {
      infer: true,
    }) as ConfigurationType['jwtSetting'];
  }

  async createConfirmationCode({ email }: { email: string }) {
    return {
      confirmationCode: await this.createToken({
        payload: { email },
        secret: this.jwtConfiguration.confirmationCodeSecret,
        expiresIn: this.jwtConfiguration.confirmationCodeLifeTime,
      }),
    };
  }

  async createRecoveryCode({ email }: { email: string }) {
    return {
      recoveryCode: await this.createToken({
        payload: { email },
        secret: this.jwtConfiguration.recoveryCodeSecret,
        expiresIn: this.jwtConfiguration.recoveryCodeLifeTime,
      }),
    };
  }

  async createAccessAndRefreshTokens({ userId, deviceUuid }: { userId: string; deviceUuid: string }) {
    const accessToken = await this.createToken({
      payload: { userId },
      secret: this.jwtConfiguration.accessTokenSecret,
      expiresIn: this.jwtConfiguration.accessTokenLifeTime,
    });

    const refreshToken = await this.createToken({
      payload: { userId, deviceUuid },
      secret: this.jwtConfiguration.refreshTokenSecret,
      expiresIn: this.jwtConfiguration.refreshTokenLifeTime,
    });

    const payload = await this.jwtService.decode(refreshToken);

    return { accessToken, refreshToken, payload };
  }

  async verifyConfirmationCode({ confirmationCode }: { confirmationCode: string }) {
    return await this.verifyToken({
      token: confirmationCode,
      secret: this.jwtConfiguration.confirmationCodeSecret,
      errorMessage: JwtAdapter.ERROR_CONFIRMATION_CODE_EXPIRED,
    });
  }

  async verifyRecoveryCode({ recoveryCode }: { recoveryCode: string }) {
    return await this.verifyToken({
      token: recoveryCode,
      secret: this.jwtConfiguration.recoveryCodeSecret,
      errorMessage: JwtAdapter.ERROR_RECOVERY_CODE_EXPIRED,
    });
  }

  private async createToken({
    payload,
    secret,
    expiresIn,
  }: {
    payload: object;
    secret: string;
    expiresIn: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, { secret, expiresIn });
  }

  private async verifyToken({ token, secret, errorMessage }: { token: string; secret: string; errorMessage: string }) {
    try {
      await this.jwtService.verifyAsync(token, { secret });
    } catch (e) {
      this.logger.error(`Token verification failed: ${e.message}`);
      return ObjResult.Err(new BadRequestError(errorMessage, [{ message: errorMessage, field: 'code' }]));
    }
  }

  private static readonly ERROR_CONFIRMATION_CODE_EXPIRED = 'Confirmation code is expired';
  private static readonly ERROR_RECOVERY_CODE_EXPIRED = 'Recovery code is expired';
}
