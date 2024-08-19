import { UserRepository } from '../../user/repository/user.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserInputModel } from '../dto/input/login.user.dto';

export class LoginUserCommand {
  constructor(public inputModel: LoginUserInputModel) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  execute(command: LoginUserCommand): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
