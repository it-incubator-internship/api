import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../repository/session.repository';
import { UserSession } from '../../user/class/session.fabric';
import { ConfigurationType } from '../../../../common/settings/configuration';
import { secondToMillisecond } from '../../../../../../app/src/common/constants/constants';
import { ObjResult } from '../../../../../../common/utils/result/object-result';

export class LoginUserCommand {
  constructor(public inputModel: {ipAddress: string, userAgent: string, userId: string}) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly sessionRepository: SessionRepository,
  ) {}
  async execute(command: LoginUserCommand): Promise<any> {
    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

    // создание accessToken
    const accessTokenPayload = {userId: command.inputModel.userId}
    const accessTokenSecret = jwtConfiguration.accessTokenSecret as string;
    const accessTokenLifeTime = jwtConfiguration.accessTokenLifeTime as string;
    const accessToken = this.jwtService.sign(accessTokenPayload, {secret: accessTokenSecret, expiresIn: accessTokenLifeTime })

    // создание refreshToken
    const deviceUuid = randomUUID()
    const refreshTokenPayload = {userId: command.inputModel.userId, deviceUuid}
    const refreshTokenSecret = jwtConfiguration.refreshTokenSecret as string;
    const refreshTokenLifeTime = jwtConfiguration.refreshTokenLifeTime as string;
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {secret: refreshTokenSecret, expiresIn: refreshTokenLifeTime })

    const payload = await this.jwtService.decode(refreshToken)
    const lastActiveDate = new Date(payload.iat * secondToMillisecond).toISOString()

    const session = UserSession.create({
      profileId: command.inputModel.userId,
      deviceUuid,
      deviceName: command.inputModel.userAgent,
      ip: command.inputModel.ipAddress,
      lastActiveDate,
    })

    await this.sessionRepository.createSession(session);

    return ObjResult.Ok({accessToken, refreshToken})
  }
}
