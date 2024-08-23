import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionRepository } from '../../repository/session.repository';
import { ConfigurationType } from '../../../../../common/settings/configuration';
import { secondToMillisecond } from '../../../../../common/constants/constants';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';

export class RefreshTokenCommand {
  constructor(public inputModel: { userId: string; deviceUuid: string }) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly sessionRepository: SessionRepository,
  ) {}
  async execute(command: RefreshTokenCommand): Promise<any> {
    const session = await this.sessionRepository.findSessionByDeviceUuid({ deviceUuid: command.inputModel.deviceUuid });

    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

    //TODO jwt adapter
    // создание accessToken
    const accessTokenPayload = { userId: command.inputModel.userId };
    const accessTokenSecret = jwtConfiguration.accessTokenSecret as string;
    const accessTokenLifeTime = jwtConfiguration.accessTokenLifeTime as string;
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: accessTokenSecret,
      expiresIn: accessTokenLifeTime,
    });

    // создание refreshToken
    const refreshTokenPayload = { userId: command.inputModel.userId, deviceUuid: command.inputModel.deviceUuid };
    const refreshTokenSecret = jwtConfiguration.refreshTokenSecret as string;
    const refreshTokenLifeTime = jwtConfiguration.refreshTokenLifeTime as string;
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenLifeTime,
    });

    const payload = await this.jwtService.decode(refreshToken);
    const lastActiveDate = new Date(payload.iat * secondToMillisecond);

    session!.updateLastActiveDate({ lastActiveDate });

    await this.sessionRepository.updateLastActiveDataInSession(session!);

    return ObjResult.Ok({ accessToken, refreshToken });
  }
}
