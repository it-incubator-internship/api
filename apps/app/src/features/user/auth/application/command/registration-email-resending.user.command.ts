import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { UserRepository } from '../../user/repository/user.repository';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { UserAccountData } from '../../user/class/accoun-data.fabric';
import { JwtAdapter } from '../../../../providers/jwt/jwt.adapter';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../user/repository/user.repository';
import { EmailInputModel } from '../../dto/input/email.user.dto';
import { BadRequestError } from '../../../../../../../common/utils/result/custom-error';
import { UserAccountData, UserConfirmationStatusEnum } from '../../../user/class/accoun-data.fabric';
import { ConfigurationType } from '../../../../../common/settings/configuration';
import { UserResendRegCodeEvent } from '../../../user/class/events/user-resend-reg-code.event';

export class RegistrationEmailResendingCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingHandler implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdapter: JwtAdapter,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly eventBus: EventBus,
  ) {}
  async execute(command: RegistrationEmailResendingCommand): Promise<any> {
    const user = await this.userRepository.findUserByEmail({ email: command.inputModel.email });

    if (!user) {
      return ObjResult.Err(new BadRequestError('User not found', [{ message: 'User not found', field: 'email' }]));
    }

    const userAccountData: UserAccountData | null = await this.userRepository.findAccountDataById({ id: user.id });

    if (!userAccountData) {
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    if (userAccountData.confirmationStatus === UserConfirmationStatusEnum.CONFIRM) {
      return ObjResult.Err(
        new BadRequestError('Email has already been confirmed', [
          { message: 'Email has already been confirmed', field: 'email' },
        ]),
      );
    }

    // создание confirmationCode
    const { confirmationCode } = await this.jwtAdapter.createConfirmationCode({ email: command.inputModel.email });

    userAccountData.updateConfirmationCode({ confirmationCode });

    user.events.push(new UserResendRegCodeEvent(user.name, user.email, confirmationCode));

    await this.userRepository.updateAccountData(userAccountData);

    user.events.forEach((event) => this.eventBus.publish(event));

    return ObjResult.Ok();
  }
}
