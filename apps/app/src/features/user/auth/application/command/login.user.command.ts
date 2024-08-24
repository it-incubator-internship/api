import { randomUUID } from 'crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { SessionRepository } from '../../repository/session.repository';
import { secondToMillisecond } from '../../../../../common/constants/constants';
import { UserSession } from '../../../user/class/session.fabric';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';

export class LoginUserCommand {
  constructor(public inputModel: { ipAddress: string; userAgent: string; userId: string }) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async execute(command: LoginUserCommand): Promise<any> {
    const deviceUuid = randomUUID();

    // создание accessToken и refreshToken + получение payload от refreshToken
    const { accessToken, refreshToken, payload } = await this.jwtAdapter.createAccessAndRefreshTokens({
      userId: command.inputModel.userId,
      deviceUuid,
    });

    const lastActiveDate = new Date(payload.iat * secondToMillisecond).toISOString();

    const session = UserSession.create({
      profileId: command.inputModel.userId,
      deviceUuid,
      deviceName: command.inputModel.userAgent,
      ip: command.inputModel.ipAddress,
      lastActiveDate,
    });

    await this.sessionRepository.createSession(session);

    return ObjResult.Ok({ accessToken, refreshToken });
  }
}
