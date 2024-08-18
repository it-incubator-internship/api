import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../user/repository/user.repository';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { BadRequestError, NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { EmailAdapter } from '../email.adapter/email.adapter';

export class RegistrationEmailResendingCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailAdapter: EmailAdapter,
  ) {}
  async execute(command: RegistrationEmailResendingCommand): Promise<any> {
    console.log('command in registration email resending use case:', command);

    const user = await this.userRepository.findUserByEmail({ email: command.inputModel.email });
    console.log('user in registration email resending use case:', user);

    if (!user) {
      console.log('!user');
      return ObjResult.Err(new NotFoundError('User not found'));
    }

    const userAccountData = await this.userRepository.findAccountDataById({ id: user.id });
    console.log('userAccountData in registration email resending use case:', userAccountData);

    if (!userAccountData) {
      console.log('!userAccountData');
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    const confirmationCodePayload = { email: command.inputModel.email };
    const secret = '12345'; // process.env.JWT_SECRET_CONFIRMATION_CODE   // я ещё ничего не подтягивал из .env
    // обсудить время жизни confirmationCode
    const confirmationCode = this.jwtService.sign(confirmationCodePayload, { secret: secret, expiresIn: '500s' });
    console.log('confirmationCode in registration email resending use case:', confirmationCode);

    userAccountData.updateConfirmationCode({ confirmationCode });
    console.log('userAccountData in registration email resending use case:', userAccountData);

    const savingResult = await this.userRepository.updateAccountData(userAccountData);
    console.log('savingResult in registration email resending use case:', savingResult);

    if (savingResult) {
      try {
        this.emailAdapter.sendConfirmationCodeEmail({ email: command.inputModel.email, confirmationCode });
      } catch (e) {
        console.log(e);
      }
    }

    return ObjResult.Ok();
  }
}
