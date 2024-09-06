import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EmailInputModel } from '../../dto/input/email.user.dto';
// import { UserRepository } from '../../../user/repository/user.repository';
import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../../common/utils/result/custom-error';
import { UserResendRegCodeEvent } from '../../../user/domain/events/user-resend-reg-code.event';
import { $Enums } from '../../../../../../prisma/client';
import { UserRepo } from '../../../user/repository/user.repo';
import { EntityEnum } from '../../../../../../../common/repository/base.repository';

import ConfirmationStatus = $Enums.ConfirmationStatus;

export class RegistrationEmailResendingCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingHandler implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    // private readonly userRepository: UserRepository,
    private readonly userRepo: UserRepo,
    private readonly jwtAdapter: JwtAdapter,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegistrationEmailResendingCommand): Promise<any> {
    const { email } = command.inputModel;

    // const user = await this.userRepository.findUserByEmail({ email });
    const user = await this.userRepo.findFirstOne({
      modelName: EntityEnum.user,
      conditions: { email },
    });
    if (!user) return this.createError('User not found', 'email');

    // const userAccountData = await this.userRepository.findAccountDataById({ id: user.id });
    const userAccountData = await this.userRepo.findUniqueOne({
      modelName: EntityEnum.accountData,
      conditions: { googleId: user.id },
    });
    if (!userAccountData) return this.createError('Account data not found', 'email');

    if (userAccountData.confirmationStatus === ConfirmationStatus.CONFIRM) {
      return this.createError('Email has already been confirmed', 'email');
    }

    const { confirmationCode } = await this.jwtAdapter.createConfirmationCode({ email });
    userAccountData.updateConfirmationCode({ confirmationCode });

    // await this.userRepository.updateAccountData(userAccountData);
    await this.userRepo.updateOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: userAccountData.profileId },
      data: userAccountData,
    });

    const event = new UserResendRegCodeEvent(user.name, user.email, confirmationCode);

    this.eventBus.publish(event);
    console.log(event);
    return ObjResult.Ok();
  }

  private createError(message: string, field: string) {
    return ObjResult.Err(new BadRequestError(message, [{ message, field }]));
  }
}
