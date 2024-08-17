import { UserRepository } from '../../user/repository/user.repository';
import { EmailInputModel } from '../dto/input/email.user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RegistrationEmailResendingCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  async execute(command: RegistrationEmailResendingCommand): Promise<any> {
    console.log('command in registration email resending use case:', command);
    const user = await this.userRepository.findUserByEmail({ email: command.inputModel.email });
    console.log('user in registration email resending use case:', user);
    // if (!user) return ObjResult.Err(new BadRequestError('Passwords must match', [{ message: '', field: '' }]));
    throw new Error('Method not implemented.');
  }
}
