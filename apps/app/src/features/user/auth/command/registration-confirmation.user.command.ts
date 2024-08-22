import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CodeInputModel } from '../dto/input/confirmation-code.user.dto';
import { UserRepository } from '../../user/repository/user.repository';
import { UserAccountData, UserConfirmationStatusEnum } from '../../user/class/accoun-data.fabric';
import { ConfigurationType } from '../../../../common/settings/configuration';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { secondToMillisecond } from '../../../../../../app/src/common/constants/constants';

export class RegistrationConfirmationCommand {
  constructor(public inputModel: CodeInputModel) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationHandler implements ICommandHandler<RegistrationConfirmationCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {}
  async execute(command: RegistrationConfirmationCommand): Promise<any> {
    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
    const confirmationCodeSecret = jwtConfiguration.confirmationCodeSecret as string;
    let payload

    try {
      payload = this.jwtService.verify(command.inputModel.code, { secret: confirmationCodeSecret });
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }

    if (Date.now() > payload.exp * secondToMillisecond) {
      return ObjResult.Err(new BadRequestError('Confirmation code is expired', [{ message: 'Confirmation code is expired', field: 'code' }]));
    }

    const userAccountData: UserAccountData | null = await this.userRepository.findAccountDataByConfirmationCode({
      confirmationCode: command.inputModel.code,
    });

    if (!userAccountData) {
      return ObjResult.Err(new BadRequestError('UserAccountData not found', [{ message: 'UserAccountData not found', field: 'code' }]));
    }

    if (userAccountData.confirmationStatus === UserConfirmationStatusEnum.CONFIRM) {
      return ObjResult.Err(new BadRequestError('Email has already been confirmed', [{ message: 'Email has already been confirmed', field: 'email' }]));
    }

    userAccountData.confirmationRegistration();

    await this.userRepository.updateAccountData(userAccountData);

    return ObjResult.Ok();
  }
}
