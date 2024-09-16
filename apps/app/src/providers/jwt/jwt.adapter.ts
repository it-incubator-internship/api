import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
        secret: this.jwtConfiguration.codeForEmailSecret,
        expiresIn: this.jwtConfiguration.confirmationCodeLifeTime,
      }),
    };
  }

  async createRecoveryCode({ email }: { email: string }) {
    return {
      recoveryCode: await this.createToken({
        payload: { email },
        secret: this.jwtConfiguration.codeForEmailSecret,
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
    });
  }

  async verifyRecoveryCode({ recoveryCode }: { recoveryCode: string }) {
    return await this.verifyToken({
      token: recoveryCode,
      secret: this.jwtConfiguration.recoveryCodeSecret,
    });
  }

  async verifyCodeFromEmail({ code }: { code: string }) {
    return await this.verifyToken({
      token: code,
      secret: this.jwtConfiguration.codeForEmailSecret,
    });
  }
  //TODO тут может быть любой пейлоад а не только email
  async decodeToken({ token }: { token: string }) {
    try {
      const result = await this.jwtService.decode(token);

      return { email: result.email };
    } catch (e) {
      this.logger.error(`Token verification failed: ${e.message}`);
      return null;
    }
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

  private async verifyToken({ token, secret }: { token: string; secret: string }) {
    try {
      await this.jwtService.verifyAsync(token, { secret });
      return true;
    } catch (e) {
      this.logger.error(`Token verification failed: ${e.message}`);
      return false;
    }
  }
}
