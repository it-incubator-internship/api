import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { hashSync } from 'bcryptjs';

import { UserRepository } from '../../../user/repository/user.repository';
import { hashRounds } from '../../../../../common/constants/constants';
import { UserEntity } from '../../../user/domain/user.fabric';

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

    const newUser = UserEntity.create({
      name: userName,
      email,
      passwordHash,
      accountData: { confirmationCode /* , googleId */ },
    });

    const creationResult = await this.userRepository.createUser(newUser);
    const accountData = await this.userRepository.findAccountDataById({ id: creationResult.id });

    accountData!.confirmationRegistration();

    accountData!.addGoogleId({ googleId });

    const updatingResult = await this.userRepository.updateAccountData(accountData!);

    return updatingResult;

    // console.log('создание пользователя завершено', newUser);

    // newUser.events.forEach((event) => this.eventBus.publish(event));

    // console.log('создание событий завершено', newUser);

    // return ObjResult.Ok();
  }
}
