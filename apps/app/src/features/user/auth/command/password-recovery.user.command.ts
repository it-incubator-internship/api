import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError, NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { UserRepository } from '../../user/repository/user.repository';
import { EmailAdapter } from '../email.adapter/email.adapter';
import { ConfigurationType } from '../../../../common/settings/configuration';

export class PasswordRecoveryCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailAdapter: EmailAdapter,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<any> {
    console.log('command in password recovery use case:', command);

    const user = await this.userRepository.findUserByEmail({ email: command.inputModel.email });
    console.log('user in password recovery use case:', user);

    if (!user) {
      console.log('!user');
      // return ObjResult.Err(new NotFoundError('User not found'));
      return ObjResult.Err(new BadRequestError('User not found', [{ message: 'User not found', field: 'email' }]));
    }

    const userAccountData = await this.userRepository.findAccountDataById({ id: user.id });
    console.log('userAccountData in password recovery use case:', userAccountData);

    if (!userAccountData) {
      console.log('!userAccountData');
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
    console.log('jwtConfiguration in password recovery use case:', jwtConfiguration);
    const secret = jwtConfiguration.confirmationCode as string;
    console.log('secret in password recovery use case:', secret);

    const recoveryCodePayload = { email: command.inputModel.email };
    // const secret = '12345'; // process.env.JWT_SECRET_CONFIRMATION_CODE   // я ещё ничего не подтягивал из .env

    // обсудить время жизни confirmationCode
    const recoveryCode = this.jwtService.sign(recoveryCodePayload, { secret: secret, expiresIn: '500s' });
    console.log('recoveryCode in password recovery use case:', recoveryCode);

    userAccountData.updateRecoveryCode({ recoveryCode });
    console.log('userAccountData in password recovery use case:', userAccountData);

    const savingResult = await this.userRepository.updateAccountData(userAccountData);
    console.log('savingResult in password recovery use case:', savingResult);

    // отправка письма
    this.emailAdapter.sendRecoveryCodeEmail({ email: command.inputModel.email, recoveryCode });

    return ObjResult.Ok();
  }
}
