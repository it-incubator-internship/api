import { randomUUID } from 'crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionRepository } from '../repository/session.repository';
import { UserSession } from '../../user/class/session.fabric';
import { secondToMillisecond } from '../../../../common/constants/constants';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { JwtAdapter } from '../../../../../../app/src/providers/jwt/jwt.adapter';

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
