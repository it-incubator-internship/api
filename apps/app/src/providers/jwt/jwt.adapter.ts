import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
    const confirmationCode = this.jwtService.sign(confirmationCodePayload, {
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

  async createAccessAndRefreshTokens() {}
}

// const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

//     // создание confirmationCode
//     //TODO создать jwt адптер
//     const confirmationCodePayload = { email: command.inputModel.email };
//     const confirmationCodeSecret = jwtConfiguration.confirmationCodeSecret as string;
//     const confirmationCodeLifeTime = jwtConfiguration.confirmationCodeLifeTime as string;
//     const confirmationCode = this.jwtService.sign(confirmationCodePayload, {
//       secret: confirmationCodeSecret,
//       expiresIn: confirmationCodeLifeTime,
//     });

// const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

// // создание recoveryCode
// const recoveryCodePayload = { email: command.inputModel.email };
// const recoveryCodeSecret = jwtConfiguration.recoveryCodeSecret as string;
// const recoveryCodeLifeTime = jwtConfiguration.recoveryCodeLifeTime as string;
// const recoveryCode = this.jwtService.sign(recoveryCodePayload, {
//   secret: recoveryCodeSecret,
//   expiresIn: recoveryCodeLifeTime,
// });

// const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

// // создание accessToken
// const accessTokenPayload = { userId: command.inputModel.userId };
// const accessTokenSecret = jwtConfiguration.accessTokenSecret as string;
// const accessTokenLifeTime = jwtConfiguration.accessTokenLifeTime as string;
// const accessToken = this.jwtService.sign(accessTokenPayload, {
//   secret: accessTokenSecret,
//   expiresIn: accessTokenLifeTime,
// });

// // создание refreshToken
// //TODO jwt adapter
// const deviceUuid = randomUUID();
// const refreshTokenPayload = { userId: command.inputModel.userId, deviceUuid };
// const refreshTokenSecret = jwtConfiguration.refreshTokenSecret as string;
// const refreshTokenLifeTime = jwtConfiguration.refreshTokenLifeTime as string;
// const refreshToken = this.jwtService.sign(refreshTokenPayload, {
//   secret: refreshTokenSecret,
//   expiresIn: refreshTokenLifeTime,
// });

// const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
// const confirmationCodeSecret = jwtConfiguration.confirmationCodeSecret as string;

// //TODO jwt adapter
// try {
//   await this.jwtService.verifyAsync(command.inputModel.code, { secret: confirmationCodeSecret });
// } catch (e) {
//   return ObjResult.Err(
//     new BadRequestError('Confirmation code is expired', [
//       { message: 'Confirmation code is expired', field: 'code' },
//     ]),
//   );
// }

// const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
// const recoveryCodeSecret = jwtConfiguration.recoveryCodeSecret as string;

// try {
//   this.jwtService.verify(command.inputModel.code, { secret: recoveryCodeSecret });
// } catch (e) {
//   return new BadRequestError('Recovery code is expired', [{ message: 'Recovery code is expired', field: 'code' }]);
// }
