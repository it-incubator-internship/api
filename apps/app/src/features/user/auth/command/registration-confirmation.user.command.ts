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
    console.log('command in registration confirmation use case:', command);

    const payload = this.jwtService.verify(command.inputModel.code, { secret: '12345' });
    console.log('payload in registration confirmation use case:', payload);

    const expTime = payload.exp * 1000;
    console.log('expTime in registration confirmation use case:', expTime);

    if (Date.now() > expTime) {
      console.log('Date.now() > expTime');
      new BadRequestError('Confirmation code is expired', [{ message: 'Confirmation code is expired', field: 'code' }]);
    }

    const accountData = await this.userRepository.findAccountDataByConfirmationCode({
      confirmationCode: command.inputModel.code,
    });
    console.log('accountData in registration confirmation use case:', accountData);

    if (!accountData) {
      console.log('!accountData');
      return ObjResult.Err(new NotFoundError('AccountData not found'));
    }

    accountData.confirmationRegistration();
    console.log('accountData in registration confirmation use case:', accountData);

    const savingResult = await this.userRepository.updateAccountData(accountData);
    console.log('savingResult in registration confirmation use case:', savingResult);

    return ObjResult.Ok();
  }
}
