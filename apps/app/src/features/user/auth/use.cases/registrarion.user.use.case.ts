import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../user/repository/user.repository';
import { RegistrationUserInputModel } from '../dto/input/registration.user.dto';
import { UserEntity } from '../../user/class/user.fabric';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { EmailAdapter } from '../email.adapter/email.adapter';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';

export class RegistrationUserCommand {
  constructor(public inputModel: RegistrationUserInputModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase implements ICommandHandler<RegistrationUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailAdapter: EmailAdapter,
  ) {}
  async execute(command: RegistrationUserCommand): Promise<any> {
    console.log('command in registration user use case:', command);

    // если isAgreement = false
    if (!command.inputModel.isAgreement) {
      console.log('!command.inputModel.isAgreement');
      return ObjResult.Err(
        new BadRequestError('I am teapot', [{ message: 'IsAgreement must be true', field: 'isAgreement' }]),
      );
    }

    // если password !== passwordConfirmation
    if (command.inputModel.password !== command.inputModel.passwordConfirmation) {
      console.log('command.inputModel.password !== command.inputModel.passwordConfirmation');
      return ObjResult.Err(
        new BadRequestError('Passwords must match', [
          { message: 'Passwords must match', field: 'passwordConfirmation' },
        ]),
      );
    }

    // если есть user с таким же userName, но не email
    // const userByUserNameOnly = await this.userRepository.findUserByUserNameOnly({
    //   email: command.inputModel.email,
    //   userName: command.inputModel.userName,
    // });
    // console.log('userByUserNameOnly in registration user use case:', userByUserNameOnly);

    // if (userByUserNameOnly) {
    //   console.log('userByUserNameOnly');
    //   return ObjResult.Err(
    //     new BadRequestError('User with this username is already registered', [{ message: '', field: '' }]),
    //   );
    // }

    // если есть user с таким же email, но не userName
    // const userByEmailOnly = await this.userRepository.findUserByEmailOnly({
    //   email: command.inputModel.email,
    //   userName: command.inputModel.userName,
    // });
    // console.log('userByEmailOnly in registration user use case:', userByEmailOnly);

    // if (userByEmailOnly) {
    //   console.log('userByEmailOnly');
    //   return ObjResult.Err(
    //     new BadRequestError('User with this email is already registered', [{ message: '', field: '' }]),
    //   );
    // }

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
    const secret = '12345'; // process.env.JWT_SECRET_CONFIRMATION_CODE
    const confirmationCode = this.jwtService.sign(confirmationCodePayload, { secret: secret, expiresIn: '500s' });
    console.log('confirmationCode in registration user use case:', confirmationCode);
    const passwordHash = bcrypt.hashSync(command.inputModel.password, 10);
    console.log('passwordHash in in registration user use case:', passwordHash);

    // поиск user, у которого совпадают Email, UserName и PasswordHash
    // const userByEmailAndUserName = await this.userRepository.findUserByEmailAndUserName({
    //   email: command.inputModel.email,
    //   userName: command.inputModel.userName,
    // });
    // console.log('userByEmailAndUserName in registration user use case:', userByEmailAndUserName);

    let isMatch = false;

    if (userByEmail && userByEmail.name === command.inputModel.userName) {
      isMatch = await bcrypt.compare(command.inputModel.password, userByEmail.passwordHash);
      console.log('isMatch in in registration user use case:', isMatch);
    }

    // let isMatch;

    // if (userByEmailAndUserName) {
    //   isMatch = await bcrypt.compare(command.inputModel.password, userByEmailAndUserName.passwordHash);
    // }

    // если такой user есть, то обновляем его
    if (isMatch) {
      console.log('isMatch');
      const dataForUpdating = UserEntity.create({
        name: command.inputModel.userName as string,
        email: command.inputModel.email as string,
        passwordHash,
        accountData: { confirmationCode },
      });
      // const dataForUpdating = this.createUserEntity({
      //   name: command.inputModel.userName as string,
      //   email: command.inputModel.email as string,
      //   passwordHash,
      //   confirmationCode,
      // });
      console.log('dataForUpdating in registration user use case:', dataForUpdating);

      const updatingResult = await this.userRepository.updateUser(dataForUpdating);
      console.log('updatingResult in registration user use case:', updatingResult);

      if (updatingResult) {
        console.log('updatingResult');
        try {
          this.emailAdapter.sendConfirmationCodeEmail({ email: command.inputModel.email, confirmationCode });
          // return ObjResult.Ok();
        } catch (e) {
          console.log(e);
        }
      }
      return ObjResult.Ok();
    }

    // если такого user нет, то создаём его
    const dataForCreating = UserEntity.create({
      name: command.inputModel.userName as string,
      email: command.inputModel.email as string,
      passwordHash,
      accountData: { confirmationCode },
    });
    // const dataForCreating = this.createUserEntity({
    //   name: command.inputModel.userName as string,
    //   email: command.inputModel.email as string,
    //   passwordHash,
    //   confirmationCode,
    // });
    console.log('dataForCreating in registration user use case:', dataForCreating);

    const creatingResult = await this.userRepository.createUser(dataForCreating);
    console.log('creatingResult in registration user use case:', creatingResult);

    if (creatingResult) {
      console.log('creatingResult');
      try {
        this.emailAdapter.sendConfirmationCodeEmail({ email: command.inputModel.email, confirmationCode });
        // return ObjResult.Ok();
      } catch (e) {
        console.log(e);
      }
    }
    return ObjResult.Ok();
  }

  // createUserEntity({
  //   name,
  //   email,
  //   passwordHash,
  //   confirmationCode,
  // }: {
  //   name: string;
  //   email: string;
  //   passwordHash: string;
  //   confirmationCode: string;
  // }) {
  //   console.log('name in registration user use case (createEntity):', name);
  //   console.log('email in registration user use case (createEntity):', email);
  //   console.log('passwordHash in registration user use case (createEntity):', passwordHash);
  //   console.log('confirmationCode in registration user use case (createEntity):', confirmationCode);
  //   const result = UserEntity.create({
  //     name,
  //     email,
  //     passwordHash,
  //     accountData: { confirmationCode },
  //   });
  //   console.log('result in registration user use case (createEntity):', result);
  //   return result;
  // }

  // sendEmail({}: {}) {}
}
