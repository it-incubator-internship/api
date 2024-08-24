import bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../user/repository/user.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { MailService } from '../../../../providers/mailer/mail.service';
import { hashRounds } from '../../../../../../app/src/common/constants/constants';
import { RegistrationUserInputModel } from '../dto/input/registration.user.dto';
import { UserEntity } from '../../user/class/user.fabric';
import { JwtAdapter } from '../../../../../../app/src/providers/jwt/jwt.adapter';

export class RegistrationUserCommand {
  constructor(public inputModel: RegistrationUserInputModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserHandler implements ICommandHandler<RegistrationUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly jwtAdapter: JwtAdapter,
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

    // создание confirmationCode
    const { confirmationCode } = await this.jwtAdapter.createConfirmationCode({ email: command.inputModel.email });

    // создание passwordHash
    const passwordHash = bcrypt.hashSync(command.inputModel.password, hashRounds);

    const dataForCreating = UserEntity.create({
      name: command.inputModel.userName,
      email: command.inputModel.email,
      passwordHash,
      accountData: { confirmationCode },
    });

    await this.userRepository.createUser(dataForCreating);

    // отправка письма
    try {
      await this.mailService.sendUserConfirmation({
        email: command.inputModel.email,
        login: command.inputModel.userName,
        token: confirmationCode,
      });
    } catch (e) {
      //TODO logger
      console.log(e);
    }

    return ObjResult.Ok();
  }
}
