import { UserRepository } from '../../user/repository/user.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  execute(command: RefreshTokenCommand): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
