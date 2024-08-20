import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../user/repository/user.repository';
import { CodeInputModel } from '../dto/input/confirmation-code.user.dto';
import { BadRequestError, NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { ConfigurationType } from '../../../../common/settings/configuration';
import { UserConfirmationStatusEnum } from '../../user/class/accoun-data.fabric';

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
    console.log('command in registration confirmation use case:', command);

    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
    console.log('jwtConfiguration in registration confirmation use case:', jwtConfiguration);
    const secret = jwtConfiguration.confirmationCode as string;
    console.log('secret in registration confirmation use case:', secret);

    const payload = this.jwtService.verify(command.inputModel.code, { secret });
    console.log('payload in registration confirmation use case:', payload);

    const expTime = payload.exp * 1000;
    console.log('expTime in registration confirmation use case:', expTime);

    if (Date.now() > expTime) {
      console.log('Date.now() > expTime');
      return ObjResult.Err(new BadRequestError('Confirmation code is expired', [{ message: 'Confirmation code is expired', field: 'code' }]));
    }

    const userAccountData = await this.userRepository.findAccountDataByConfirmationCode({
      confirmationCode: command.inputModel.code,
    });
    console.log('userAccountData in registration confirmation use case:', userAccountData);

    if (!userAccountData) {
      console.log('!userAccountData');
      return ObjResult.Err(new BadRequestError('UserAccountData not found', [{ message: 'UserAccountData not found', field: 'code' }]));
    }

    if (userAccountData.confirmationStatus === UserConfirmationStatusEnum.CONFIRM) {
      console.log('userAccountData.confirmationStatus === UserConfirmationStatusEnum.CONFIRM');
      return ObjResult.Err(new BadRequestError('Email has already been confirmed', [{ message: 'Email has already been confirmed', field: 'email' }]));
    }

    userAccountData.confirmationRegistration();
    console.log('userAccountData in registration confirmation use case:', userAccountData);

    const savingResult = await this.userRepository.updateAccountData(userAccountData);
    console.log('savingResult in registration confirmation use case:', savingResult);

    return ObjResult.Ok();
  }
}
