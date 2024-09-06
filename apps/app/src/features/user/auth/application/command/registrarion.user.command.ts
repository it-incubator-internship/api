import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { hashSync } from 'bcryptjs';

import { RegistrationUserInputModel } from '../../dto/input/registration.user.dto';
// import { UserRepository } from '../../../user/repository/user.repository';
import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../../common/utils/result/custom-error';
import { hashRounds } from '../../../../../common/constants/constants';
import { AccountDataEntityNEW, UserEntityNEW } from '../../../user/domain/account-data.entity';
import { UserRegistrationEvent } from '../../../user/domain/events/user-registration.event';
import { $Enums } from '../../../../../../prisma/client';
import { UserRepo } from '../../../user/repository/user.repo';

import ConfirmationStatus = $Enums.ConfirmationStatus;

export class RegistrationUserCommand {
  constructor(public inputModel: RegistrationUserInputModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserHandler implements ICommandHandler<RegistrationUserCommand> {
  constructor(
    // private readonly userRepository: UserRepository,
    private readonly userRepo: UserRepo,
    private readonly eventBus: EventBus,
    private readonly jwtAdapter: JwtAdapter,
  ) {}

  async execute(command: RegistrationUserCommand): Promise<any> {
    const { email, password, passwordConfirmation, userName, isAgreement } = command.inputModel;
    const agreementCheck = this.checkAgreement(isAgreement);
    if (agreementCheck) return agreementCheck;

    const passwordCheck = this.checkPasswordMatch(password, passwordConfirmation);
    if (passwordCheck) return passwordCheck;

    const existCheck = await this.checkAvailability(email, userName);
    if (existCheck) return existCheck;

    const { confirmationCode } = await this.jwtAdapter.createConfirmationCode({ email });

    const passwordHash = hashSync(password, hashRounds);

    const newUser = UserEntityNEW.createForDatabase({
      name: userName,
      email,
      passwordHash,
    });

    // const userFromDB = await this.userRepository.createUser(newUser);
    const userFromDB = await this.userRepo.createUser(newUser);

    const newAccountData = AccountDataEntityNEW.createForDatabase({
      profileId: userFromDB.id,
      confirmationStatus: ConfirmationStatus.NOT_CONFIRM,
      confirmationCode,
      recoveryCode: null,
      githubId: null,
      googleId: null,
    });

    //await this.userRepository.createAccountData(newAccountData);
    await this.userRepo.createAccountData(newAccountData);

    const event = new UserRegistrationEvent(userFromDB.name, email, newAccountData.confirmationCode);

    this.eventBus.publish(event);

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
    // const userByEmail = await this.userRepository.findUserByEmailOrName({ email, name: userName });
    const userByEmail = await this.userRepo.findUserByEmailOrName({ email, name: userName });
    if (userByEmail && userByEmail.email.toLowerCase() === email.toLowerCase()) {
      return this.createError(
        'User with this email is already registered',
        'User with this email is already registered',
        'email',
      );
    }

    if (userByEmail && userByEmail.name.toLowerCase() === userName.toLowerCase()) {
      return this.createError(
        'User with this user name is already registered',
        'User with this user name is already registered',
        'userName',
      );
    }
  }

  private createError(title: string, message: string, field: string) {
    console.log('123123');
    return ObjResult.Err(new BadRequestError(title, [{ message, field }]));
  }
}
