import { randomUUID } from 'crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { SessionRepository } from '../../repository/session.repository';
import { secondToMillisecond } from '../../../../../common/constants/constants';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { UserSession } from '../../../user/domain/session.fabric';
import { UserRepository } from '../../../user/repository/user.repository';
import { UserConfirmationStatusEnum } from '../../../user/domain/accoun-data.fabric';
import { ForbiddenError } from '../../../../../../../common/utils/result/custom-error';

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

    const user = await this.userRepository.findAccountDataById({ id: command.inputModel.userId });

    if (user!.confirmationStatus === UserConfirmationStatusEnum.NOT_CONFIRM) {
      return ObjResult.Err(new ForbiddenError(`User with this email doesn't exist`));
    }

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
