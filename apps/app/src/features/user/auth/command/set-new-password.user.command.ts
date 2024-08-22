import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletionSessionsCommand } from './deletion-sessions.command';
import { NewPasswordInputModel } from '../dto/input/new-password.user.dto';
import { UserRepository } from '../../user/repository/user.repository';
import { ConfigurationType } from '../../../../common/settings/configuration';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError, NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { hashRounds, secondToMillisecond } from '../../../../../../app/src/common/constants/constants';
import { UserAccountData } from '../../user/class/accoun-data.fabric';

export class SetNewPasswordCommand {
  constructor(public inputModel: NewPasswordInputModel) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordHandler implements ICommandHandler<SetNewPasswordCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType, true>,
    private commandBus: CommandBus,
  ) {}
  async execute(command: SetNewPasswordCommand): Promise<any> {
    // если newPassword !== passwordConfirmation
    if (command.inputModel.newPassword !== command.inputModel.passwordConfirmation) {
      return ObjResult.Err(
        new BadRequestError('Passwords must match', [
          { message: 'Passwords must match', field: 'passwordConfirmation' },
        ]),
      );
    }

    const jwtConfiguration = this.configService.get('jwtSetting', { infer: true });
    const recoveryCodeSecret = jwtConfiguration.recoveryCodeSecret as string;
    let payload

    try {
      payload = this.jwtService.verify(command.inputModel.code, { secret: recoveryCodeSecret });
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }

    if (Date.now() > payload.exp * secondToMillisecond) {
      new BadRequestError('Recovery code is expired', [{ message: 'Recovery code is expired', field: 'code' }]);
    }

    const accountData: UserAccountData | null = await this.userRepository.findAccountDataByRecoveryCode({
      recoveryCode: command.inputModel.code,
    });

    if (!accountData) {
      return ObjResult.Err(new NotFoundError('AccountData not found'));
    }

    const user = await this.userRepository.findUserById({ id: accountData.profileId });

    if (!user) {
      return ObjResult.Err(new BadRequestError('I am teapot', [{ message: '', field: '' }]));
    }

    const passwordHash = bcrypt.hashSync(command.inputModel.newPassword, hashRounds);

    user.updatePasswordHash({ passwordHash });

    await this.userRepository.updateUser(user);

    await this.commandBus.execute(new DeletionSessionsCommand({id: user.id}));

    return ObjResult.Ok();
  }
}
