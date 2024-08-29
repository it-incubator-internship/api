import { hashSync } from 'bcrypt';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../../user/repository/user.repository';
// import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { hashRounds } from '../../../../../common/constants/constants';
import { UserEntity } from '../../../user/domain/user.fabric';

export class RegistrationUserByGoogleCommand {
  constructor(public inputModel: { googleId: string; password: string; email: string; userName: string }) {}
}

@CommandHandler(RegistrationUserByGoogleCommand)
export class RegistrationUserByGoogleHandler implements ICommandHandler<RegistrationUserByGoogleCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    // private readonly jwtAdapter: JwtAdapter,
  ) {}

  async execute(command: RegistrationUserByGoogleCommand): Promise<any> {
    const { googleId, password, email, userName } = command.inputModel;
    console.log('googleId in registration user by google command:', googleId);
    console.log('password in registration user by google command:', password);
    console.log('email in registration user by google command:', email);
    console.log('userName in registration user by google command:', userName);

    // const existCheck = await this.checkAvailability(email, userName);
    // if (existCheck) return existCheck;

    const confirmationCode = '';
    console.log('confirmationCode in registration user by google command:', confirmationCode);

    const passwordHash = hashSync(password, hashRounds);
    console.log('passwordHash in registration user by google command:', passwordHash);

    const newUser = UserEntity.create({
      name: userName,
      email,
      passwordHash,
      accountData: { confirmationCode /* , googleId */ },
    });
    console.log('newUser in registration user by google command:', newUser);

    const creationResult = await this.userRepository.createUser(newUser);
    console.log('creationResult in registration user by google command:', creationResult);

    const accountData = await this.userRepository.findAccountDataById({ id: creationResult.id });
    console.log('accountData in registration user by google command:', accountData);

    accountData!.confirmationRegistration();
    console.log('accountData in registration user by google command:', accountData);

    accountData!.addGoogleId({ googleId });
    console.log('accountData in registration user by google command:', accountData);

    const updatingResult = await this.userRepository.updateAccountData(accountData!);
    console.log('updatingResult in registration user by google command:', updatingResult);

    return updatingResult;

    // console.log('создание пользователя завершено', newUser);

    // newUser.events.forEach((event) => this.eventBus.publish(event));

    // console.log('создание событий завершено', newUser);

    // return ObjResult.Ok();
  }

  // private checkAgreement(isAgreement: boolean) {
  //   if (!isAgreement) {
  //     return this.createError('I am teapot', 'IsAgreement must be true', 'isAgreement');
  //   }
  // }

  // private checkPasswordMatch(password: string, passwordConfirmation: string) {
  //   if (password !== passwordConfirmation) {
  //     return this.createError('Passwords must match', 'Passwords must match', 'passwordConfirmation');
  //   }
  // }

  // private async checkAvailability(email: string, userName: string) {
  //   const userByEmail = await this.userRepository.findByEmailOrName({ email, name: userName });

  //   console.log(userByEmail, 'userByEmail');

  //   if (userByEmail && userByEmail.email === email) {
  //     return this.createError(
  //       'User with this email is already registered',
  //       'User with this email is already registered',
  //       'email',
  //     );
  //   }

  //   if (userByEmail && userByEmail.name === userName) {
  //     return this.createError(
  //       'User with this user name is already registered',
  //       'User with this user name is already registered',
  //       'userName',
  //     );
  //   }
  // }

  // private createError(title: string, message: string, field: string) {
  //   return ObjResult.Err(new BadRequestError(title, [{ message, field }]));
  // }
}
