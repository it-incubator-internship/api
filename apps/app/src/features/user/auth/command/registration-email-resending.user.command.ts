import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../user/repository/user.repository';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { BadRequestError, NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { EmailAdapter } from '../email.adapter/email.adapter';
import { ConfigurationType } from '../../../../common/settings/configuration';
import { UserConfirmationStatusEnum } from '../../user/class/accoun-data.fabric';

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
      // return ObjResult.Err(new NotFoundError('User not found'));
      return ObjResult.Err(new BadRequestError('User not found', [{ message: 'User not found', field: 'email' }]));
    }

    const userAccountData = await this.userRepository.findAccountDataById({ id: user.id });
    console.log('userAccountData in registration email resending use case:', userAccountData);

    if (!userAccountData) {
      console.log('!userAccountData');
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    if (userAccountData.confirmationStatus === UserConfirmationStatusEnum.CONFIRM) {
      console.log('userAccountData.confirmationStatus === UserConfirmationStatusEnum.CONFIRM');
      return ObjResult.Err(new BadRequestError('Email has already been confirmed', [{ message: 'Email has already been confirmed', field: 'email' }]));
    }

    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
    console.log('jwtConfiguration in registration email resending use case:', jwtConfiguration);
    const secret = jwtConfiguration.confirmationCode as string;
    console.log('secret in registration email resending use case:', secret);

    const confirmationCodePayload = { email: command.inputModel.email };
    console.log('confirmationCodePayload in registration email resending use case:', confirmationCodePayload);

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
