import { ConfigService } from '@nestjs/config';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { EmailInputModel } from '../../dto/input/email.user.dto';
import { UserRepository } from '../../../user/repository/user.repository';
import { ConfigurationType } from '../../../../../common/settings/configuration';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../../common/utils/result/custom-error';
import { UserAccountData } from '../../../user/class/accoun-data.fabric';
import { UserNewPasswordRegCodeEvent } from '../../../user/class/events/user-new-password-reg-code.event';

export class PasswordRecoveryCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly eventBus: EventBus,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<any> {
    const user = await this.userRepository.findUserByEmail({ email: command.inputModel.email });

    if (!user) {
      return ObjResult.Err(new BadRequestError('User not found', [{ message: 'User not found', field: 'email' }]));
    }

    const userAccountData: UserAccountData | null = await this.userRepository.findAccountDataById({ id: user.id });

    if (!userAccountData) {
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

    // создание recoveryCode
    const recoveryCodePayload = { email: command.inputModel.email };
    const recoveryCodeSecret = jwtConfiguration.recoveryCodeSecret as string;
    const recoveryCodeLifeTime = jwtConfiguration.recoveryCodeLifeTime as string;
    const recoveryCode = this.jwtService.sign(recoveryCodePayload, {
      secret: recoveryCodeSecret,
      expiresIn: recoveryCodeLifeTime,
    });

    userAccountData.updateRecoveryCode({ recoveryCode });

    user.events.push(new UserNewPasswordRegCodeEvent(user.name, user.email, recoveryCode));

    await this.userRepository.updateAccountData(userAccountData);

    user.events.forEach((e) => this.eventBus.publish(e));

    return ObjResult.Ok();
  }
}
