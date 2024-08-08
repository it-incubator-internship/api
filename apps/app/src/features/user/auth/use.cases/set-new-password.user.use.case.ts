import { UserRepository } from '../../user/repository/user.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordInputModel } from '../dto/input/new-password.user.dto';

export class SetNewPasswordCommand {
  constructor(public inputModel: NewPasswordInputModel) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase implements ICommandHandler<SetNewPasswordCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  execute(command: SetNewPasswordCommand): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
