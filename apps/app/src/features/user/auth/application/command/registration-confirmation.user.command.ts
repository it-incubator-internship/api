import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CodeInputModel } from '../dto/input/confirmation-code.user.dto';
import { UserRepository } from '../../user/repository/user.repository';
import { UserAccountData, UserConfirmationStatusEnum } from '../../user/class/accoun-data.fabric';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { JwtAdapter } from '../../../../../../app/src/providers/jwt/jwt.adapter';

export class RegistrationConfirmationCommand {
  constructor(public inputModel: CodeInputModel) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationHandler implements ICommandHandler<RegistrationConfirmationCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async execute(command: RegistrationConfirmationCommand): Promise<any> {
    // верификация confirmationCode
    await this.jwtAdapter.verifyConfirmationCode({ confirmationCode: command.inputModel.code });

    const userAccountData: UserAccountData | null = await this.userRepository.findAccountDataByConfirmationCode({
      confirmationCode: command.inputModel.code,
    });

    if (!userAccountData) {
      return ObjResult.Err(
        new BadRequestError('UserAccountData not found', [{ message: 'UserAccountData not found', field: 'code' }]),
      );
    }

    if (userAccountData.confirmationStatus === UserConfirmationStatusEnum.CONFIRM) {
      return ObjResult.Err(
        new BadRequestError('Email has already been confirmed', [
          { message: 'Email has already been confirmed', field: 'code' },
        ]),
      );
    }

    userAccountData.confirmationRegistration();

    await this.userRepository.updateAccountData(userAccountData);

    return ObjResult.Ok();
  }
}
