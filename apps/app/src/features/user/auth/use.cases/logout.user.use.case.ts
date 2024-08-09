import { UserRepository } from '../../user/repository/user.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class LogoutUserCommand {
  // public inputModel: {userId: string, deviceId: string}
  constructor() {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  execute(command: LogoutUserCommand): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
