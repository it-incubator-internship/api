import { randomBytes, randomUUID } from 'crypto';

import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ObjResult } from '../../../../../../../../common/utils/result/object-result';
import { UserRepository } from '../../../../user/repository/user.repository';
import { RegistrationUserByGoogleCommand } from '../registration-by-google.user.command';
import { EntityEnum } from '../../../../../../../../common/repository/base.repository';

export class GoogleAuthCommand {
  constructor(
    public inputModel: {
      googleId: string;
      email: string | null;
    },
  ) {}
}

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler implements ICommandHandler<GoogleAuthCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private commandBus: CommandBus,
  ) {}
  async execute(command: GoogleAuthCommand): Promise<any> {
    // поиск user по googleId
    const accountDataByGoogleId = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.accountData,
      conditions: { googleId: command.inputModel.googleId },
    });

    // если user по googleId найден
    if (accountDataByGoogleId) {
      return ObjResult.Ok({ userId: accountDataByGoogleId.profileId });
    }

    // если user по googleId не найден и не приходит email
    if (!command.inputModel.email) {
      const email = '';

      const random = randomBytes(3).toString('hex');

      const userName = 'user' + random;

      const password = randomUUID();

      const registrationResult = await this.commandBus.execute(
        new RegistrationUserByGoogleCommand({
          googleId: command.inputModel.googleId,
          password,
          email,
          userName,
        }),
      );

      return ObjResult.Ok({ userId: registrationResult.profileId });
    }

    // если user по googleId не найден, но приходит email
    if (command.inputModel.email) {
      // поиск user по email
      const userByEmail = await this.userRepository.findFirstOne({
        modelName: EntityEnum.user,
        conditions: { email: command.inputModel.email },
      });

      // если user по email найден
      if (userByEmail) {
        const accountData = await this.userRepository.findUniqueOne({
          modelName: EntityEnum.accountData,
          conditions: { profileId: userByEmail.id },
        });

        accountData!.addGoogleId({ googleId: command.inputModel.googleId });

        await this.userRepository.updateOne({
          modelName: EntityEnum.accountData,
          conditions: { profileId: accountData.profileId },
          data: accountData,
        });

        return ObjResult.Ok({ userId: accountData!.profileId });
      }

      // если user по email не найден
      if (!userByEmail) {
        const email = command.inputModel.email;

        const index = email.indexOf('@');
        let userName;
        if (index !== -1) {
          userName = email.slice(0, index);
        }

        const userByUserName = await this.userRepository.findUniqueOne({
          modelName: EntityEnum.user,
          conditions: { name: userName },
        });

        if (userByUserName) {
          const random = randomBytes(3).toString('hex');

          userName = userName + random;
        }

        const password = randomUUID();

        const registrationResult = await this.commandBus.execute(
          new RegistrationUserByGoogleCommand({
            googleId: command.inputModel.googleId,
            password,
            email,
            userName,
          }),
        );

        return ObjResult.Ok({ userId: registrationResult.profileId });
      }
    }
  }
}
