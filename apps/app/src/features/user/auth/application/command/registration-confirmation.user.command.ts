import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CodeInputModel } from '../../dto/input/confirmation-code.user.dto';
// import { UserRepository } from '../../../user/repository/user.repository';
import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../../common/utils/result/custom-error';
import { $Enums } from '../../../../../../prisma/client';
import { UserRepo } from '../../../user/repository/user.repo';
import { EntityEnum } from '../../../../../../../common/repository/base.repository';

import ConfirmationStatus = $Enums.ConfirmationStatus;

export class RegistrationConfirmationCommand {
  constructor(public inputModel: CodeInputModel) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationHandler implements ICommandHandler<RegistrationConfirmationCommand> {
  constructor(
    // private readonly userRepository: UserRepository,
    private readonly userRepo: UserRepo,
    private readonly jwtAdapter: JwtAdapter,
  ) {}

  async execute(command: RegistrationConfirmationCommand): Promise<any> {
    console.log('command in registration confirmation user command:', command);
    const { code } = command.inputModel;
    console.log('code in registration confirmation user command:', code);

    // Верификация confirmationCode
    const verificationError = await this.verifyConfirmationCode(code);
    console.log('verificationError in registration confirmation user command:', verificationError);
    if (verificationError) return verificationError;

    // Поиск данных аккаунта пользователя
    // const userAccountData = await this.userRepository.findAccountDataByConfirmationCode({ confirmationCode: code });
    const userAccountData = await this.userRepo.findFirstOne({
      modelName: EntityEnum.accountData,
      conditions: { confirmationCode: code },
    });
    console.log('userAccountData in registration confirmation user command:', userAccountData);

    if (!userAccountData) {
      console.log('!userAccountData');
      return this.createError('UserAccountData not found', 'UserAccountData not found', 'code');
    }

    if (userAccountData.confirmationStatus === ConfirmationStatus.CONFIRM) {
      console.log('userAccountData.confirmationStatus === ConfirmationStatus.CONFIRM');
      return this.createError('Email has already been confirmed', 'Email has already been confirmed', 'code');
    }

    // Подтверждение регистрации и обновление данных аккаунта
    userAccountData.confirmationRegistration();
    console.log('userAccountData in registration confirmation user command:', userAccountData);
    // await this.userRepository.updateAccountData(userAccountData);
    const xxx = await this.userRepo.updateOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: userAccountData.profileId },
      data: userAccountData,
    });
    console.log('xxx in registration confirmation user command:', xxx);

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
