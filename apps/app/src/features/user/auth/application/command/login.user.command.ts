import { randomUUID } from 'crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
// import { SessionRepository } from '../../repository/session.repository';
import { secondToMillisecond } from '../../../../../common/constants/constants';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
// import { UserRepository } from '../../../user/repository/user.repository';
import { ForbiddenError } from '../../../../../../../common/utils/result/custom-error';
import { $Enums } from '../../../../../../prisma/client';
import { SessionEntityNEW } from '../../../user/domain/account-data.entity';
import { UserRepo } from '../../../user/repository/user.repo';
import { EntityEnum } from '../../../../../../../common/repository/base.repository';
import { SessionRepo } from '../../repository/session.repo';

import ConfirmationStatus = $Enums.ConfirmationStatus;

export class LoginUserCommand {
  constructor(public inputModel: { ipAddress: string; userAgent: string; userId: string }) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    // private readonly userRepository: UserRepository,
    private readonly userRepo: UserRepo,
    // private readonly sessionRepository: SessionRepository,
    private readonly sessionRepo: SessionRepo,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async execute(command: LoginUserCommand): Promise<ObjResult<{ accessToken: string; refreshToken: string }>> {
    const deviceUuid = randomUUID();

    // const user = await this.userRepository.findAccountDataById({ id: command.inputModel.userId });
    const user = await this.userRepo.findUniqueOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: command.inputModel.userId },
    });

    if (user!.confirmationStatus === ConfirmationStatus.NOT_CONFIRM) {
      return ObjResult.Err(new ForbiddenError(`User with this email doesn't exist`));
    }

    // создание accessToken и refreshToken + получение payload от refreshToken
    const { accessToken, refreshToken, payload } = await this.jwtAdapter.createAccessAndRefreshTokens({
      userId: command.inputModel.userId,
      deviceUuid,
    });

    const lastActiveDate = new Date(payload.iat * secondToMillisecond).toISOString();

    const session = SessionEntityNEW.createForDatabase({
      profileId: command.inputModel.userId,
      deviceUuid,
      deviceName: command.inputModel.userAgent,
      ip: command.inputModel.ipAddress,
      lastActiveDate: new Date(lastActiveDate),
    });

    // await this.sessionRepository.createSession(session);
    await this.sessionRepo.createSession(session);

    return ObjResult.Ok({ accessToken, refreshToken });
  }
}
