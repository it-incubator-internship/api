import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { EmailInputModel } from '../dto/input/email.user.dto';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError, NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { UserRepository } from '../../user/repository/user.repository';
import { EmailAdapter } from '../email.adapter/email.adapter';

export class PasswordRecoveryCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailAdapter: EmailAdapter,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<any> {
    const user = await this.userRepository.findUserByEmail({ email: command.inputModel.email });

    if (!user) {
      console.log('!user');
      return ObjResult.Err(new NotFoundError('User not found'));
    }

    const userAccountData = await this.userRepository.findAccountDataById({ id: user.id });

    if (!userAccountData) {
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    const recoveryCodePayload = { email: command.inputModel.email };
    const secret = '12345'; // process.env.JWT_SECRET_CONFIRMATION_CODE   // я ещё ничего не подтягивал из .env
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
