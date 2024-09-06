import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CodeInputModel } from '../../dto/input/confirmation-code.user.dto';
import { UserRepository } from '../../../user/repository/user.repository';
import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../../common/utils/result/custom-error';
import { $Enums } from '../../../../../../prisma/client';
import { EntityEnum } from '../../../../../../../common/repository/base.repository';

import ConfirmationStatus = $Enums.ConfirmationStatus;

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
    const { code } = command.inputModel;

    // Верификация confirmationCode
    const verificationError = await this.verifyConfirmationCode(code);
    if (verificationError) return verificationError;

    // Поиск данных аккаунта пользователя
    const userAccountData = await this.userRepository.findFirstOne({
      modelName: EntityEnum.accountData,
      conditions: { confirmationCode: code },
    });

    if (!userAccountData) {
      return this.createError('UserAccountData not found', 'UserAccountData not found', 'code');
    }

    if (userAccountData.confirmationStatus === ConfirmationStatus.CONFIRM) {
      return this.createError('Email has already been confirmed', 'Email has already been confirmed', 'code');
    }

    // Подтверждение регистрации и обновление данных аккаунта
    userAccountData.confirmationRegistration();
    await this.userRepository.updateOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: userAccountData.profileId },
      data: userAccountData,
    });

    return ObjResult.Ok();
  }

  private async verifyConfirmationCode(code: string) {
    try {
      await this.jwtAdapter.verifyConfirmationCode({ confirmationCode: code });
    } catch (error) {
      return this.createError('Invalid confirmation code', 'The provided confirmation code is invalid', 'code');
    }
  }

  private createError(title: string, message: string, field: string) {
    return ObjResult.Err(new BadRequestError(title, [{ message, field }]));
  }
}
