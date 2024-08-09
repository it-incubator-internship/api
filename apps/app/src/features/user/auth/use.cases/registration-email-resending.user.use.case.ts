import { UserRepository } from '../../user/repository/user.repository';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RegistrationEmailResendingCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  execute(command: RegistrationEmailResendingCommand): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
