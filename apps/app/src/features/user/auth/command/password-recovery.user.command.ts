import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EmailInputModel } from '../dto/input/email.user.dto';
import { UserRepository } from '../../user/repository/user.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { UserAccountData } from '../../user/class/accoun-data.fabric';
import { MailService } from '../../../../providers/mailer/mail.service';
import { JwtAdapter } from '../../../../../../app/src/providers/jwt/jwt.adapter';

export class PasswordRecoveryCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly jwtAdapter: JwtAdapter,
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

    // создание recoveryCode
    const { recoveryCode } = await this.jwtAdapter.createRecoveryCode({ email: command.inputModel.email });

    userAccountData.updateRecoveryCode({ recoveryCode });

    await this.userRepository.updateAccountData(userAccountData);

    // отправка письма
    this.mailService.sendPasswordRecovery({
      email: command.inputModel.email,
      login: user.name,
      recoveryCode,
    });

    return ObjResult.Ok();
  }
}
