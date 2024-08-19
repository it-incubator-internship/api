import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../user/repository/user.repository';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { BadRequestError, NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { EmailAdapter } from '../email.adapter/email.adapter';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../common/settings/configuration';

export class RegistrationEmailResendingCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingHandler implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailAdapter: EmailAdapter,
    private readonly configService: ConfigService<ConfigurationType, true>,
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

    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
    const secret = jwtConfiguration.confirmationCode as string;

    const confirmationCodePayload = { email: command.inputModel.email };

    // обсудить время жизни confirmationCode
    const confirmationCode = this.jwtService.sign(confirmationCodePayload, { secret: secret, expiresIn: '500s' });
    console.log('confirmationCode in registration email resending use case:', confirmationCode);

    userAccountData.updateConfirmationCode({ confirmationCode });
    console.log('userAccountData in registration email resending use case:', userAccountData);

    const savingResult = await this.userRepository.updateAccountData(userAccountData);
    console.log('savingResult in registration email resending use case:', savingResult);

    // отправка письма
    this.emailAdapter.sendConfirmationCodeEmail({ email: command.inputModel.email, confirmationCode });

    return ObjResult.Ok();
  }
}
