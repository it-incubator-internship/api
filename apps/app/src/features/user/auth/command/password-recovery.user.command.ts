import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { EmailAdapter } from '../email.adapter/email.adapter';
import { UserRepository } from '../../user/repository/user.repository';
import { ConfigurationType } from '../../../../common/settings/configuration';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { UserAccountData } from '../../user/class/accoun-data.fabric';

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
    const user = await this.userRepository.findUserByEmail({ email: command.inputModel.email });

    if (!user) {
      return ObjResult.Err(new BadRequestError('User not found', [{ message: 'User not found', field: 'email' }]));
    }

    const userAccountData: UserAccountData | null = await this.userRepository.findAccountDataById({ id: user.id });

    if (!userAccountData) {
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

    // создание recoveryCode
    const recoveryCodePayload = { email: command.inputModel.email };
    const recoveryCodeSecret = jwtConfiguration.recoveryCodeSecret as string;
    const recoveryCodeLifeTime = jwtConfiguration.recoveryCodeLifeTime as string;
    const recoveryCode = this.jwtService.sign(recoveryCodePayload, { secret: recoveryCodeSecret, expiresIn: recoveryCodeLifeTime });

    userAccountData.updateRecoveryCode({ recoveryCode });

    await this.userRepository.updateAccountData(userAccountData);

    // отправка письма
    this.emailAdapter.sendRecoveryCodeEmail({ email: command.inputModel.email, recoveryCode });

    return ObjResult.Ok();
  }
}
