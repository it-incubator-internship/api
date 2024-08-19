import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../user/repository/user.repository';
import { RegistrationUserInputModel } from '../dto/input/registration.user.dto';
import { UserEntity } from '../../user/class/user.fabric';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { EmailAdapter } from '../email.adapter/email.adapter';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { MailService } from '../../../../providers/mailer/mail.service';

export class RegistrationUserCommand {
  constructor(public inputModel: RegistrationUserInputModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserHandler implements ICommandHandler<RegistrationUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailAdapter: EmailAdapter,
    private readonly mailService: MailService,
  ) {}
  async execute(command: RegistrationUserCommand): Promise<any> {
    if (!command.inputModel.isAgreement) {
      return ObjResult.Err(
        new BadRequestError('I am teapot', [{ message: 'IsAgreement must be true', field: 'isAgreement' }]),
      );
    }

    if (command.inputModel.password !== command.inputModel.passwordConfirmation) {
      console.log('command.inputModel.password !== command.inputModel.passwordConfirmation');
      return ObjResult.Err(
        new BadRequestError('Passwords must match', [
          { message: 'Passwords must match', field: 'passwordConfirmation' },
        ]),
      );
    }

    // в строках 46-68 происходит проверка наличия в бд пользователей с вводимыми email или userName
    // если у user совпадает email, но не совпадает userName, то email занят
    // если у user совпадает userName, но не совпадает email, то userName занят
    const userByEmail = await this.userRepository.findUserByEmail({ email: command.inputModel.email });
    console.log('userByEmail in registration user use case:', userByEmail);

    if (userByEmail && userByEmail?.name !== command.inputModel.userName) {
      console.log('userByEmail?.name !== command.inputModel.userName');
      return ObjResult.Err(
        new BadRequestError('User with this email is already registered', [
          { message: 'User with this email is already registered', field: 'email' },
        ]),
      );
    }

    const userByUserName = await this.userRepository.findUserByUserName({ userName: command.inputModel.userName });
    console.log('userByUserName in registration user use case:', userByUserName);

    if (userByUserName && userByUserName?.email !== command.inputModel.email) {
      console.log('userByUserName?.name !== command.inputModel.email');
      return ObjResult.Err(
        new BadRequestError('User with this user name is already registered', [
          { message: 'User with this user name is already registered', field: 'userName' },
        ]),
      );
    }

    const confirmationCodePayload = { email: command.inputModel.email };
    const secret = '12345'; // process.env.JWT_SECRET_CONFIRMATION_CODE   // я ещё ничего не подтягивал из .env
    // обсудить время жизни confirmationCode
    const confirmationCode = this.jwtService.sign(confirmationCodePayload, { secret: secret, expiresIn: '500s' });
    console.log('confirmationCode in registration user use case:', confirmationCode);
    const passwordHash = bcrypt.hashSync(command.inputModel.password, 10);
    console.log('passwordHash in registration user use case:', passwordHash);

    let isMatch = false;

    // проверка на совпадение password
    if (userByEmail && userByEmail.name === command.inputModel.userName) {
      isMatch = await bcrypt.compare(command.inputModel.password, userByEmail.passwordHash);
      console.log('isMatch in in registration user use case:', isMatch);
    }

    // если email, userName и password совпадают, то обновляем этого пользователя
    if (isMatch) {
      console.log('isMatch');

      const dataForUpdating = UserEntity.create({
        name: command.inputModel.userName as string,
        email: command.inputModel.email as string,
        passwordHash,
        accountData: { confirmationCode },
      });
      console.log('dataForUpdating in registration user use case:', dataForUpdating);

      const updatingResult = await this.userRepository.updateUser(dataForUpdating);
      console.log('updatingResult in registration user use case:', updatingResult);

      // отправка письма
      this.emailAdapter.sendConfirmationCodeEmail({ email: command.inputModel.email, confirmationCode });

      return ObjResult.Ok();
    }

    // если по email, userName и password совпадений нет, то создаём нового пользователя
    const dataForCreating = UserEntity.create({
      name: command.inputModel.userName as string,
      email: command.inputModel.email as string,
      passwordHash,
      accountData: { confirmationCode },
    });
    console.log('dataForCreating in registration user use case:', dataForCreating);

    const creatingResult = await this.userRepository.createUser(dataForCreating);
    console.log('creatingResult in registration user use case:', creatingResult);

    // отправка письма
    this.mailService.sendUserConfirmation({
      email: command.inputModel.email,
      login: command.inputModel.userName,
      token: confirmationCode,
    });
    this.emailAdapter.sendConfirmationCodeEmail({ email: command.inputModel.email, confirmationCode });

    return ObjResult.Ok();
  }
}
