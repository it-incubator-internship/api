import bcrypt from 'bcrypt';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { RegistrationUserInputModel } from '../../dto/input/registration.user.dto';
import { UserRepository } from '../../../user/repository/user.repository';
import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../../common/utils/result/custom-error';
import { hashRounds } from '../../../../../common/constants/constants';
import { UserEntity } from '../../../user/domain/user.fabric';

export class RegistrationUserCommand {
  constructor(public inputModel: RegistrationUserInputModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserHandler implements ICommandHandler<RegistrationUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly jwtAdapter: JwtAdapter,
  ) {}

  async execute(command: RegistrationUserCommand): Promise<any> {
    const { email, password, passwordConfirmation, userName, isAgreement } = command.inputModel;
    console.log('команда сработала', email, password, passwordConfirmation, userName, isAgreement);
    const agreementCheck = this.checkAgreement(isAgreement);
    if (agreementCheck) return agreementCheck;

    const passwordCheck = this.checkPasswordMatch(password, passwordConfirmation);
    if (passwordCheck) return passwordCheck;

    const existCheck = await this.checkAvailability(email, userName);
    if (existCheck) return existCheck;

    const { confirmationCode } = await this.jwtAdapter.createConfirmationCode({ email });

    console.log('перед bcrypt');
    const passwordHash = bcrypt.hashSync(password, hashRounds);
    console.log('после bcrypt', passwordHash);

    console.log('создаем пользователя', userName, email, passwordHash, confirmationCode);
    const newUser = UserEntity.create({
      name: userName,
      email,
      passwordHash,
      accountData: { confirmationCode },
    });

    await this.userRepository.createUser(newUser);

    console.log('создание пользователя завершено', newUser);

    newUser.events.forEach((event) => this.eventBus.publish(event));

    console.log('создание событий завершено', newUser);

    return ObjResult.Ok();
  }

  private checkAgreement(isAgreement: boolean) {
    if (!isAgreement) {
      return this.createError('I am teapot', 'IsAgreement must be true', 'isAgreement');
    }
  }

  private checkPasswordMatch(password: string, passwordConfirmation: string) {
    if (password !== passwordConfirmation) {
      return this.createError('Passwords must match', 'Passwords must match', 'passwordConfirmation');
    }
  }

  private async checkAvailability(email: string, userName: string) {
    const userByEmail = await this.userRepository.findByEmailOrName({ email, name: userName });

    console.log(userByEmail, 'userByEmail');

    if (userByEmail && userByEmail.email === email) {
      return this.createError(
        'User with this email is already registered',
        'User with this email is already registered',
        'email',
      );
    }

    if (userByEmail && userByEmail.name === userName) {
      return this.createError(
        'User with this user name is already registered',
        'User with this user name is already registered',
        'userName',
      );
    }
  }

  private createError(title: string, message: string, field: string) {
    return ObjResult.Err(new BadRequestError(title, [{ message, field }]));
  }
}
