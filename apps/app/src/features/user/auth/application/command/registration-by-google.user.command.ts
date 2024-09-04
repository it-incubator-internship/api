import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { hashSync } from 'bcryptjs';

import { UserRepository } from '../../../user/repository/user.repository';
import { hashRounds } from '../../../../../common/constants/constants';
import { UserOauthRegisreationEvent } from '../events/user-oauth-regisreation.event';
import { AccountDataEntityNEW, UserEntityNEW } from '../../../user/domain/account-data.entity';
import { $Enums } from '../../../../../../prisma/client';

import ConfirmationStatus = $Enums.ConfirmationStatus;

export class RegistrationUserByGoogleCommand {
  constructor(public inputModel: { googleId: string; password: string; email: string; userName: string }) {}
}
//TODO добавить ивенты
@CommandHandler(RegistrationUserByGoogleCommand)
export class RegistrationUserByGoogleHandler implements ICommandHandler<RegistrationUserByGoogleCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegistrationUserByGoogleCommand): Promise<any> {
    const { googleId, password, email, userName } = command.inputModel;
    const confirmationCode = '';
    const passwordHash = hashSync(password, hashRounds);

    const newUser = UserEntityNEW.createForDatabase({
      name: userName,
      email,
      passwordHash,
    });

    const creationResult = await this.userRepository.createUser(newUser);

    const accountDataForDB = AccountDataEntityNEW.createForDatabase({
      profileId: creationResult.id,
      confirmationStatus: ConfirmationStatus.CONFIRM,
      confirmationCode,
      recoveryCode: null,
      githubId: null,
      googleId,
    });

    await this.userRepository.createAccountData(accountDataForDB);

    if (newUser.email.length > 2) {
      const event = new UserOauthRegisreationEvent(newUser.name, newUser.email, 'google');
      this.eventBus.publish(event);
    }
  }
}
