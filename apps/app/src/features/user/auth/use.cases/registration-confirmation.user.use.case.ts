import { UserRepository } from '../../user/repository/user.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CodeInputModel } from '../dto/input/confirmation-code.user.dto';

export class RegistrationConfirmationCommand {
  constructor(public inputModel: CodeInputModel) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase implements ICommandHandler<RegistrationConfirmationCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  execute(command: RegistrationConfirmationCommand): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
