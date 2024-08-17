import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { UserRepository } from '../../user/repository/user.repository';
import { EmailAdapter } from '../email.adapter/email.adapter';

export class PasswordRecoveryCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailAdapter: EmailAdapter,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<any> {
    console.log('command in password recovery use case:', command);

    const user = await this.userRepository.findUserByEmail({ email: command.inputModel.email });
    console.log('user in password recovery use case:', user);

    if (!user) {
      console.log('!user');
      return ObjResult.Err(
        new BadRequestError("User with this email doesn't exist", [
          { message: "User with this email doesn't exist", field: 'email' },
        ]),
      );
    }

    // throw new Error('Method not implemented.');
    const userAccountData = await this.userRepository.findUserAccountDataById({ id: user.id });
    console.log('userAccountData in password recovery use case:', userAccountData);

    if (!userAccountData) {
      console.log('!userAccountData');
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    const recoveryCodePayload = { email: command.inputModel.email };
    const secret = '12345'; // process.env.JWT_SECRET_CONFIRMATION_CODE
    const recoveryCode = this.jwtService.sign(recoveryCodePayload, { secret: secret, expiresIn: '500s' });
    console.log('recoveryCode in registration user use case:', recoveryCode);

    userAccountData.updateRecoveryCode({ recoveryCode });
    console.log('userAccountData in registration user use case:', userAccountData);

    const savingResult = await this.userRepository.updateAccountData(userAccountData);
    console.log('savingResult in registration user use case:', savingResult);

    if (savingResult) {
      try {
        this.emailAdapter.sendRecoveryCodeEmail({ email: command.inputModel.email, recoveryCode });
      } catch (e) {
        console.log(e);
      }
    }

    return ObjResult.Ok();
  }
}
