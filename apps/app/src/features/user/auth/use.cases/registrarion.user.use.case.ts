import { UserRepository } from '../../user/repository/user.repository';
import { RegistrationUserInputModel } from '../dto/input/registration.user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RegistrationUserCommand {
  constructor(public inputModel: RegistrationUserInputModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase implements ICommandHandler<RegistrationUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  execute(command: RegistrationUserCommand): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
