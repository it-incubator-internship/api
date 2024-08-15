import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../user/repository/user.repository';
import { RegistrationUserInputModel } from '../dto/input/registration.user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../../user/class/user.fabric';
import bcrypt from 'bcrypt';
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

    const userByEmail = await this.userRepository.findUserByEmail({ email: command.inputModel.email });

    if (userByEmail)
      return ObjResult.Err(
        new BadRequestError('User with this email is already registered', [{ message: '', field: '' }]),
      );

    const userByUserName = await this.userRepository.findUserByUserName({ userName: command.inputModel.userName });

    if (userByUserName)
      return ObjResult.Err(
        new BadRequestError('User with this username is already registered', [{ message: '', field: '' }]),
      );

    if (command.inputModel.password !== command.inputModel.passwordConfirmation)
      return ObjResult.Err(new BadRequestError('Passwords must match', [{ message: '', field: '' }]));

    if (!command.inputModel.isAgreement)
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));

    // return ObjResult.Err(new BadRequestError('test is required', 'test'))

    const confirmationCodePayload = { email: command.inputModel.email };
    const secret = '12345'; // process.env.JWT_SECRET_CONFIRMATION_CODE
    const confirmationCode = this.jwtService.sign(confirmationCodePayload, { secret: secret, expiresIn: '500s' });
    console.log('confirmationCode in registration user use case:', confirmationCode);
    const passwordHash = bcrypt.hashSync(command.inputModel.password, 10);
    console.log('passwordHash in in registration user use case:', passwordHash);

    const dataForCreating = UserEntity.create({
      name: /* data.data.name as string */ command.inputModel.userName as string,
      email: /* data.data.email as string */ command.inputModel.email as string,
      passwordHash /* data.data.password as string */ /* command.inputModel.password as string */,
      accountData: { confirmationCode },
    });
    console.log('dataForCreating in registration user use case:', dataForCreating);

    const result = await this.userRepository.createUser(/* newProfile */ dataForCreating);

    // console.log('++++++++++++++++++++++++++++++++++++++++++');
    console.log('result in user service:', result);
    // console.log('++++++++++++++++++++++++++++++++++++++++++');

    if (result) {
      try {
        await this.emailAdapter.sendConfirmationCodeEmail({ email: command.inputModel.email, confirmationCode }); // с await не проходили тесты проверки дз
        return ObjResult.Ok(result);
      } catch (e) {
        console.log(e);
      }
    }

    return ObjResult.Ok(result);
  }
}
