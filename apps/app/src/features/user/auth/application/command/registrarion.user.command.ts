import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../../user/repository/user.repository';
import { ConfigurationType } from '../../../../../common/settings/configuration';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../../common/utils/result/custom-error';
import { hashRounds } from '../../../../../common/constants/constants';
import { RegistrationUserInputModel } from '../../dto/input/registration.user.dto';
import { UserEntity } from '../../../user/class/user.fabric';

export class RegistrationUserCommand {
  constructor(public inputModel: RegistrationUserInputModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserHandler implements ICommandHandler<RegistrationUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly eventBus: EventBus,
  ) {}
  async execute(command: RegistrationUserCommand): Promise<any> {
    if (!command.inputModel.isAgreement) {
      return ObjResult.Err(
        new BadRequestError('I am teapot', [{ message: 'IsAgreement must be true', field: 'isAgreement' }]),
      );
    }

    if (command.inputModel.password !== command.inputModel.passwordConfirmation) {
      return ObjResult.Err(
        new BadRequestError('Passwords must match', [
          { message: 'Passwords must match', field: 'passwordConfirmation' },
        ]),
      );
    }

    // в строках 47-65 происходит проверка наличия в бд пользователей с вводимыми email или userName
    // если у user совпадает email, но не совпадает userName, то email занят
    // если у user совпадает userName, но не совпадает email, то userName занят
    const userByEmail = await this.userRepository.findUserByEmail({ email: command.inputModel.email });

    if (userByEmail && userByEmail?.name !== command.inputModel.userName) {
      return ObjResult.Err(
        new BadRequestError('User with this email is already registered', [
          { message: 'User with this email is already registered', field: 'email' },
        ]),
      );
    }

    const userByUserName = await this.userRepository.findUserByUserName({ userName: command.inputModel.userName });

    if (userByUserName && userByUserName?.email !== command.inputModel.email) {
      return ObjResult.Err(
        new BadRequestError('User with this user name is already registered', [
          { message: 'User with this user name is already registered', field: 'userName' },
        ]),
      );
    }

    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

    // создание confirmationCode
    //TODO создать jwt адптер
    const confirmationCodePayload = { email: command.inputModel.email };
    const confirmationCodeSecret = jwtConfiguration.confirmationCodeSecret as string;
    const confirmationCodeLifeTime = jwtConfiguration.confirmationCodeLifeTime as string;
    const confirmationCode = this.jwtService.sign(confirmationCodePayload, {
      secret: confirmationCodeSecret,
      expiresIn: confirmationCodeLifeTime,
    });

    // создание passwordHash
    const passwordHash = bcrypt.hashSync(command.inputModel.password, hashRounds);

    const newUser = UserEntity.create({
      name: command.inputModel.userName,
      email: command.inputModel.email,
      passwordHash,
      accountData: { confirmationCode },
    });

    await this.userRepository.createUser(newUser);

    newUser.events.forEach((event) => this.eventBus.publish(event));

    return ObjResult.Ok();
  }
}
