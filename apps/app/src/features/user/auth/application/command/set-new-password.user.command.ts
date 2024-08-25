import bcrypt from 'bcrypt';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../../user/repository/user.repository';
import { NewPasswordInputModel } from '../../dto/input/new-password.user.dto';
import { hashRounds } from '../../../../../common/constants/constants';
import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError, NotFoundError } from '../../../../../../../common/utils/result/custom-error';
import { UserAccountData } from '../../../user/domain/accoun-data.fabric';

import { DeletionSessionsCommand } from './deletion-sessions.command';

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
    await this.jwtAdapter.verifyRecoveryCode({ recoveryCode: command.inputModel.code });

    const accountData: UserAccountData | null = await this.userRepository.findAccountDataByRecoveryCode({
      recoveryCode: command.inputModel.code,
    });

    if (!accountData) {
      return ObjResult.Err(new NotFoundError('AccountData not found'));
    }

    const user = await this.userRepository.findUserById({ id: accountData.profileId });

    if (!user) {
      throw new Error(`User with id ${accountData.profileId} not found, but recovery code is valid`);
    }

    const passwordHash = bcrypt.hashSync(command.inputModel.newPassword, hashRounds);

    user.updatePasswordHash({ passwordHash });

    await this.userRepository.updateUser(user);

    await this.commandBus.execute(new DeletionSessionsCommand({ id: user.id }));

    return ObjResult.Ok();
  }
}
