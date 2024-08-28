import { randomBytes, randomUUID } from 'crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { hashSync } from 'bcryptjs';

import { GithubData } from '../../../controller/passport/github-oauth.strategy';
import { UserRepository } from '../../../../user/repository/user.repository';
import { UserEntity } from '../../../../user/domain/user.fabric';
import { UserAccountData, UserConfirmationStatusEnum } from '../../../../user/domain/accoun-data.fabric';
import { generatePassword } from '../../../../../../../../common/utils/password-generator';

export class GithubOauthCommand {
  constructor(public data: GithubData) {}
}

@CommandHandler(GithubOauthCommand)
export class GithubOauthHandler implements ICommandHandler<GithubOauthCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: GithubOauthCommand) {
    const { id, displayName, email } = command.data;

    let existingUser: null | { userId: string } = null;

    if (email) {
      existingUser = await this.checkExistUser({ email });
      if (existingUser) {
        await this.addProviderToUser({ userId: existingUser.userId, providerId: id });
        return;
      }
    }

    // Если email отсутствует или пользователь не найден, создаем нового пользователя
    await this.createNewUser({ id, displayName, email });
  }

  private async addProviderToUser({ userId, providerId }) {
    await this.userRepository.addAccountDataGitHubProvider({ userId, providerId });
  }

  private async createNewUser({ id, displayName, email }) {
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

    await this.userRepository.createUser(newUser);
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
