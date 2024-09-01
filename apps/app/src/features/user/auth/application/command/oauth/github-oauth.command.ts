import { randomBytes, randomUUID } from 'crypto';

import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { hashSync } from 'bcryptjs';

import { GithubData } from '../../../controller/passport/github/github-oauth.strategy';
import { UserRepository } from '../../../../user/repository/user.repository';
import { UserEntity } from '../../../../user/domain/user.fabric';
import { UserAccountData, UserConfirmationStatusEnum } from '../../../../user/domain/accoun-data.fabric';
import { generatePassword } from '../../../../../../../../common/utils/password-generator';
import { ObjResult } from '../../../../../../../../common/utils/result/object-result';
import { UserOauthRegisreationEvent } from '../../events/user-oauth-regisreation.event';

export class GithubOauthCommand {
  constructor(public data: GithubData) {}
}

@CommandHandler(GithubOauthCommand)
export class GithubOauthHandler implements ICommandHandler<GithubOauthCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: GithubOauthCommand) {
    const { id, displayName, email } = command.data;

    let existingUser: null | { userId: string } = null;

    if (email) {
      existingUser = await this.checkExistUser({ email });
      if (existingUser) {
        await this.addProviderToUser({ userId: existingUser.userId, providerId: id });
        return ObjResult.Ok({ userId: existingUser.userId });
      }
    }

    // Если email отсутствует или пользователь не найден, создаем нового пользователя
    const { userId } = await this.createNewUser({ id, displayName, email });
    return ObjResult.Ok({ userId });
  }

  private async addProviderToUser({ userId, providerId }) {
    await this.userRepository.addAccountDataGitHubProvider({ userId, providerId });
  }

  private async createNewUser({ id, displayName, email }): Promise<{ userId: string }> {
    const password = generatePassword();
    const userName = await this.generateUserName(displayName);

    const accountData = UserAccountData.create({ confirmationCode: randomUUID() });
    accountData.confirmationStatus = UserConfirmationStatusEnum.CONFIRM;
    accountData.githubId = id;

    const newUser = UserEntity.create({
      name: userName,
      email: email ?? '',
      passwordHash: hashSync(password, 10),
    });
    newUser.accountData = accountData as UserAccountData;

    if (newUser.email.length > 2) {
      const event = new UserOauthRegisreationEvent(newUser.name, newUser.email);
      this.eventBus.publish(event);
    }

    const createdUser = await this.userRepository.createUser(newUser);
    return { userId: createdUser.id };
  }

  private async generateUserName(userName: string): Promise<string> {
    const existingUser = await this.userRepository.findUserByUserName({ userName });

    if (existingUser) {
      const randomSuffix = randomBytes(3).toString('hex');
      return `${userName}${randomSuffix}`;
    }

    return userName;
  }

  private async checkExistUser({ email }: { email: string }) {
    const user = await this.userRepository.findUserByEmail({ email });
    return user ? { userId: user.id } : null;
  }
}
