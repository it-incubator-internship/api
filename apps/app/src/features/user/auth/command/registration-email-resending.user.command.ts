import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../user/repository/user.repository';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { UserAccountData, UserConfirmationStatusEnum } from '../../user/class/accoun-data.fabric';
import { ConfigurationType } from '../../../../common/settings/configuration';
import { MailService } from '../../../../providers/mailer/mail.service';

export class RegistrationEmailResendingCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingHandler implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {}
  async execute(command: RegistrationEmailResendingCommand): Promise<any> {
    const user = await this.userRepository.findUserByEmail({ email: command.inputModel.email });

    if (!user) {
      return ObjResult.Err(new BadRequestError('User not found', [{ message: 'User not found', field: 'email' }]));
    }

    const userAccountData: UserAccountData | null = await this.userRepository.findAccountDataById({ id: user.id });

    if (!userAccountData) {
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    if (userAccountData.confirmationStatus === UserConfirmationStatusEnum.CONFIRM) {
      return ObjResult.Err(
        new BadRequestError('Email has already been confirmed', [
          { message: 'Email has already been confirmed', field: 'email' },
        ]),
      );
    }

    //TODO jwt adapter
    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });

    // создание confirmationCode
    const confirmationCodePayload = { email: command.inputModel.email };
    const confirmationCodeSecret = jwtConfiguration.confirmationCodeSecret as string;
    const confirmationCodeLifeTime = jwtConfiguration.confirmationCodeLifeTime as string;
    const confirmationCode = this.jwtService.sign(confirmationCodePayload, {
      secret: confirmationCodeSecret,
      expiresIn: confirmationCodeLifeTime,
    });

    userAccountData.updateConfirmationCode({ confirmationCode });

    await this.userRepository.updateAccountData(userAccountData);

    // отправка письма
    this.mailService.sendUserConfirmation({
      email: command.inputModel.email,
      login: user.name,
      token: confirmationCode,
    });

    return ObjResult.Ok();
  }
}
