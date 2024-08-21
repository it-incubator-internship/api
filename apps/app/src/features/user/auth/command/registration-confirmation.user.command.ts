import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../user/repository/user.repository';
import { CodeInputModel } from '../dto/input/confirmation-code.user.dto';
import { BadRequestError, NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { ObjResult } from '../../../../../../common/utils/result/object-result';

export class RegistrationConfirmationCommand {
  constructor(public inputModel: CodeInputModel) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationHandler implements ICommandHandler<RegistrationConfirmationCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}
  async execute(command: RegistrationConfirmationCommand): Promise<any> {
    const payload = this.jwtService.verify(command.inputModel.code, { secret: '12345' });

    const expTime = payload.exp * 1000;

    if (Date.now() > expTime) {
      new BadRequestError('Confirmation code is expired', [{ message: 'Confirmation code is expired', field: 'code' }]);
    }

    const accountData = await this.userRepository.findAccountDataByConfirmationCode({
      confirmationCode: command.inputModel.code,
    });

    if (!accountData) {
      return ObjResult.Err(new NotFoundError('AccountData not found'));
    }

    accountData.confirmationRegistration();

    await this.userRepository.updateAccountData(accountData);

    return ObjResult.Ok();
  }
}
