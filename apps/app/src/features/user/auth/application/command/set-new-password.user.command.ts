import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { hashSync } from 'bcryptjs';

import { UserRepository } from '../../../user/repository/user.repository';
import { EntityEnum } from '../../../../../../../common/repository/base.repository';
import { NewPasswordInputModel } from '../../dto/input/new-password.user.dto';
import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../../../../../common/utils/result/custom-error';
import { hashRounds } from '../../../../../../../common/constants/constants';

import { DeletionSessionsCommand } from './session/deletion-sessions.command';

export class SetNewPasswordCommand {
  constructor(public inputModel: NewPasswordInputModel) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordHandler implements ICommandHandler<SetNewPasswordCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdapter: JwtAdapter,
    private commandBus: CommandBus,
  ) {}
  async execute(command: SetNewPasswordCommand): Promise<any> {
    // если newPassword !== passwordConfirmation
    if (command.inputModel.newPassword !== command.inputModel.passwordConfirmation) {
      return ObjResult.Err(
        new BadRequestError('Passwords must match', [
          { message: 'Passwords must match', field: 'passwordConfirmation' },
        ]),
      );
    }

    // верификация recoveryCode
    const verificationResult = await this.jwtAdapter.verifyRecoveryCode({ recoveryCode: command.inputModel.code });

    if (!verificationResult) {
      return ObjResult.Err(new ForbiddenError('Invalid recovery code'));
    }

    const accountData = await this.userRepository.findFirstOne({
      modelName: EntityEnum.accountData,
      conditions: { recoveryCode: command.inputModel.code },
    });

    if (!accountData) {
      return ObjResult.Err(new NotFoundError('AccountData not found'));
    }

    const user = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.user,
      conditions: { id: accountData.profileId },
    });

    if (!user) {
      throw new Error(`User with id ${accountData.profileId} not found, but recovery code is valid`);
    }

    const passwordHash = hashSync(command.inputModel.newPassword, hashRounds);

    user.updatePasswordHash({ passwordHash });

    await this.userRepository.updateOne({
      modelName: EntityEnum.user,
      conditions: { id: user.id },
      data: user,
    });

    await this.commandBus.execute(new DeletionSessionsCommand({ id: user.id }));

    return ObjResult.Ok();
  }
}
