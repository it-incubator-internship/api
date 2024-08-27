import { randomBytes, randomUUID } from 'crypto';

import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { hashSync } from 'bcrypt';

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
  constructor(
    private readonly userRepository: UserRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: GithubOauthCommand) {
    const { id, displayName, email } = command.data;

    let isExistUser: null | { userId: string } = null;

    if (email) {
      isExistUser = await this.checkExistUser({ email });
    }

    if (!isExistUser) {
      await this.createNewUser({ id, displayName, oldEmail: email });
    }

    if (isExistUser) {
      await this.createNewUser({ id, displayName, oldEmail: email });
    }
  }
  //TODO обговорить
  private async addProviderToUser({ userId, provider }) {
    await this.userRepository.addProviderToUser({ userId, provider });
  }
  private async createNewUser({ id, displayName, oldEmail }) {
    const password = generatePassword();
    const userName = await this.generateUserName({ userName: displayName });
    //TODO переговорить с фронтом
    const email = oldEmail ?? '';

    const accountData = UserAccountData.create({ confirmationCode: randomUUID() });
    accountData.confirmationStatus = UserConfirmationStatusEnum.CONFIRM;
    accountData.githubId = id;

    const newUser = UserEntity.create({
      name: userName.login,
      email,
      passwordHash: hashSync(password, 10),
    });
    newUser.accountData = accountData as UserAccountData;

    await this.userRepository.createUser(newUser);
  }
  private async generateUserName({ userName }: { userName: string }) {
    const isExistUser = await this.userRepository.findUserByUserName({ userName: userName });

    if (isExistUser) {
      const random = randomBytes(3).toString('hex');
      return { login: userName + random };
    }

    return { login: userName };
  }
  private async checkExistUser({ email }: { email: string }) {
    const user = await this.userRepository.findUserByEmail({ email });
    if (!user) return null;
    return { userId: user.id };
  }
}
