import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EmailInputModel } from '../../dto/input/email.user.dto';
import { UserRepository } from '../../../user/repository/user.repository';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../../common/utils/result/custom-error';
import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { UserNewPasswordRegCodeEvent } from '../../../user/domain/events/user-new-password-reg-code.event';
import { UserAccountData } from '../../../user/domain/accoun-data.fabric';

export class PasswordRecoveryCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<any> {
    const user = await this.userRepository.findUserByEmail({ email: command.inputModel.email });

    if (!user) {
      return ObjResult.Err(
        new BadRequestError(`User with this email doesn't exist`, [
          {
            message: `User with this email doesn't exist`,
            field: 'email',
          },
        ]),
      );
    }

    const userAccountData: UserAccountData | null = await this.userRepository.findAccountDataById({ id: user.id });

    if (!userAccountData) {
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    // создание recoveryCode
    const { recoveryCode } = await this.jwtAdapter.createRecoveryCode({ email: command.inputModel.email });

    userAccountData.updateRecoveryCode({ recoveryCode });

    await this.userRepository.updateAccountData(userAccountData);

    user.events.push(new UserNewPasswordRegCodeEvent(user.name, user.email, recoveryCode));

    await this.userRepository.updateAccountData(userAccountData);

    user.events.forEach((e) => this.eventBus.publish(e));

    return ObjResult.Ok();
  }
}
