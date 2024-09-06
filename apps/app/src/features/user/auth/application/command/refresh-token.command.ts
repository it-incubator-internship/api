import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

// import { SessionRepository } from '../../repository/session.repository';
import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { secondToMillisecond } from '../../../../../common/constants/constants';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { SessionRepo } from '../../repository/session.repo';
import { EntityEnum } from '../../../../../../../common/repository/base.repository';

export class TokensPair {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenCommand {
  constructor(public inputModel: { userId: string; deviceUuid: string }) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    // private readonly sessionRepository: SessionRepository,
    private readonly sessionRepo: SessionRepo,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async execute(command: RefreshTokenCommand): Promise<ObjResult<TokensPair>> {
    // const session = await this.sessionRepository.findSessionByDeviceUuid({ deviceUuid: command.inputModel.deviceUuid });
    const session = await this.sessionRepo.findUniqueOne({
      modelName: EntityEnum.session,
      conditions: { deviceUuid: command.inputModel.deviceUuid },
    });

    // создание accessToken и refreshToken + получение payload от refreshToken
    const { accessToken, refreshToken, payload } = await this.jwtAdapter.createAccessAndRefreshTokens({
      userId: command.inputModel.userId,
      deviceUuid: command.inputModel.deviceUuid,
    });

    const lastActiveDate = new Date(payload.iat * secondToMillisecond);

    session!.updateLastActiveDate({ lastActiveDate });

    // await this.sessionRepository.updateLastActiveDataInSession(session!);
    await this.sessionRepo.updateLastActiveDataInSession(session!);

    return ObjResult.Ok({ accessToken, refreshToken });
  }
}
