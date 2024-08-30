import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EmailInputModel } from '../../dto/input/email.user.dto';
import { UserRepository } from '../../../user/repository/user.repository';
import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../../common/utils/result/custom-error';
import { UserConfirmationStatusEnum } from '../../../user/domain/accoun-data.fabric';
import { UserResendRegCodeEvent } from '../../../user/domain/events/user-resend-reg-code.event';

export class RegistrationEmailResendingCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingHandler implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdapter: JwtAdapter,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegistrationEmailResendingCommand): Promise<any> {
    const { email } = command.inputModel;

    const user = await this.userRepository.findUserByEmail({ email });
    console.log('user in registrtion email resending command:', user)
    if (!user) return this.createError('User not found', 'email');

    const userAccountData = await this.userRepository.findAccountDataById({ id: user.id });
    console.log('userAccountData in registrtion email resending command:', userAccountData)
    if (!userAccountData) return this.createError('Account data not found', 'email');

    if (userAccountData.confirmationStatus === UserConfirmationStatusEnum.CONFIRM) {
      return this.createError('Email has already been confirmed', 'email');
    }

    const { confirmationCode } = await this.jwtAdapter.createConfirmationCode({ email });
    console.log('confirmationCode in registrtion email resending command:', confirmationCode)
    userAccountData.updateConfirmationCode({ confirmationCode });
    console.log('userAccountData in registrtion email resending command:', userAccountData)

    user.events.push(new UserResendRegCodeEvent(user.name, user.email, confirmationCode));
    // await this.userRepository.updateAccountData(userAccountData);
    const result = await this.userRepository.updateAccountData(userAccountData);
    console.log('result in registrtion email resending command:', result)
    user.events.forEach((event) => this.eventBus.publish(event));

    return ObjResult.Ok();
  }

  private createError(message: string, field: string) {
    return ObjResult.Err(new BadRequestError(message, [{ message, field }]));
  }
}
