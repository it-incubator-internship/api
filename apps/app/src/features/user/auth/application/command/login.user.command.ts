import { randomUUID } from 'crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { SessionRepository } from '../../repository/session.repository';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../user/repository/user.repository';
import { ForbiddenError } from '../../../../../../../common/utils/result/custom-error';
import { $Enums } from '../../../../../../prisma/client';
import { SessionEntityNEW } from '../../../user/domain/account-data.entity';
import { EntityEnum } from '../../../../../../../common/repository/base.repository';
import { secondToMillisecond } from '../../../../../../../common/constants/constants';

import ConfirmationStatus = $Enums.ConfirmationStatus;

export class LoginUserCommand {
  constructor(public inputModel: { ipAddress: string; userAgent: string; userId: string }) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async execute(command: LoginUserCommand): Promise<ObjResult<{ accessToken: string; refreshToken: string }>> {
    const deviceUuid = randomUUID();
    console.log('WTFFFFFFFF');

    const user = await this.userRepository.findUniqueOne({
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

    await this.sessionRepository.createSession(session);

    return ObjResult.Ok({ accessToken, refreshToken });
  }
}
