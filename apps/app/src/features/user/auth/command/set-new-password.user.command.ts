import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UserRepository } from '../../user/repository/user.repository';
import { NewPasswordInputModel } from '../dto/input/new-password.user.dto';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError, NotFoundError } from '../../../../../../common/utils/result/custom-error';

export class SetNewPasswordCommand {
  constructor(public inputModel: NewPasswordInputModel) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordHandler implements ICommandHandler<SetNewPasswordCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}
  async execute(command: SetNewPasswordCommand): Promise<any> {
    console.log('command in set new password use case:', command);

    // если newPassword !== passwordConfirmation
    if (command.inputModel.newPassword !== command.inputModel.passwordConfirmation) {
      console.log('command.inputModel.newPassword !== command.inputModel.passwordConfirmation');
      return ObjResult.Err(
        new BadRequestError('Passwords must match', [
          { message: 'Passwords must match', field: 'passwordConfirmation' },
        ]),
      );
    }

    const payload = this.jwtService.verify(command.inputModel.code, { secret: '12345' });
    console.log('payload in set new password use case:', payload);

    const expTime = payload.exp * 1000;
    console.log('expTime in set new password use case:', expTime);

    if (Date.now() > expTime) {
      console.log('Date.now() > expTime');
      new BadRequestError('Recovery code is expired', [{ message: 'Recovery code is expired', field: 'code' }]);
    }

    const accountData = await this.userRepository.findAccountDataByRecoveryCode({
      recoveryCode: command.inputModel.code,
    });
    console.log('accountData in set new password use case:', accountData);

    if (!accountData) {
      console.log('!accountData');
      return ObjResult.Err(new NotFoundError('AccountData not found'));
    }

    const user = await this.userRepository.findUserById({ id: accountData.profileId });
    console.log('user in set new password use case:', user);

    if (!user) {
      console.log('!user');
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    const passwordHash = bcrypt.hashSync(command.inputModel.newPassword, 10);
    console.log('passwordHash in set new password use case:', passwordHash);

    user.updatePasswordHash({ passwordHash });
    console.log('user in set new password use case:', user);

    const savingResult = await this.userRepository.updateUser(user);
    console.log('savingResult in set new password use case:', savingResult);

    return ObjResult.Ok();
  }
}
