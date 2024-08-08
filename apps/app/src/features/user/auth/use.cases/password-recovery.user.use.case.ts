import { UserRepository } from '../../user/repository/user.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailInputModel } from '../dto/input/email.user.dto';

export class PasswordRecoveryCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  execute(command: PasswordRecoveryCommand): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
