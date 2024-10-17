import { randomBytes, randomUUID } from 'crypto';

import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { hashSync } from 'bcryptjs';

import { EntityEnum } from '../../../../../../../../common/repository/base.repository';
import { GithubData } from '../../../controller/passport/github/github-oauth.strategy';
import { UserRepository } from '../../../../user/repository/user.repository';
import { generatePassword } from '../../../../../../../../common/utils/password-generator';
import { ObjResult } from '../../../../../../../../common/utils/result/object-result';
import { UserOauthRegisreationEvent } from '../../events/user-oauth-regisreation.event';
import { AccountDataEntityNEW, UserEntityNEW } from '../../../../user/domain/account-data.entity';
import { $Enums } from '../../../../../../../prisma/client';

import ConfirmationStatus = $Enums.ConfirmationStatus;

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
    // await this.userRepository.addAccountDataGitHubProvider({ userId, providerId });
    await this.userRepository.updateOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: userId },
      data: { githubId: providerId },
    });

    await this.userRepository.updateOne({
      modelName: EntityEnum.accountData,
      conditions: { profileId: userId },
      data: { githubId: providerId },
    });
  }

  private async createNewUser({ id, displayName, email }): Promise<{ userId: string }> {
    const password = generatePassword();
    const userName = await this.generateUserName(displayName);

    const newUser = UserEntityNEW.createForDatabase({
      name: userName,
      email: email ?? '',
      passwordHash: hashSync(password, 10),
    });

    const userFromDb = await this.userRepository.createUser(newUser);

    const accountData = AccountDataEntityNEW.createForDatabase({
      profileId: userFromDb.id,
      confirmationCode: randomUUID(),
      confirmationStatus: ConfirmationStatus.CONFIRM,
      recoveryCode: null,
      githubId: id,
      googleId: null,
    });

    await this.userRepository.createAccountData(accountData);

    if (newUser.email.length > 2) {
      const event = new UserOauthRegisreationEvent(newUser.name, newUser.email, 'github');
      this.eventBus.publish(event);
    }

    return { userId: userFromDb.id };
  }

  private async generateUserName(userName: string): Promise<string> {
    const existingUser = await this.userRepository.findUniqueOne({
      modelName: EntityEnum.user,
      conditions: { name: userName },
    });

    if (existingUser) {
      const randomSuffix = randomBytes(3).toString('hex');
      return `${userName}${randomSuffix}`;
    }

    return userName;
  }

  private async checkExistUser({ email }: { email: string }) {
    const user = await this.userRepository.findFirstOne({
      modelName: EntityEnum.user,
      conditions: { email: email.toLowerCase() },
    });
    return user ? { userId: user.id } : null;
  }
}
