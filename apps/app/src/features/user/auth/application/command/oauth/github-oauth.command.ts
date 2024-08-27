import { randomBytes } from 'crypto';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { GithubData } from '../../../controller/passport/github-oauth.strategy';
import { UserRepository } from '../../../../user/repository/user.repository';

export class GithubOauthCommand {
  constructor(public data: GithubData) {}
}

@CommandHandler(GithubOauthCommand)
export class GithubOauthHandler implements ICommandHandler<GithubOauthCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: GithubOauthCommand) {
    const { id, displayName, email } = command.data;

    const { login } = await this.generateUserName({ userName: displayName });
    console.log(login);
  }

  private async generateUserName({ userName }: { userName: string }) {
    const isExistUser = await this.userRepository.findUserByUserName({ userName: userName });

    if (isExistUser) {
      const random = randomBytes(3).toString('hex');
      return { login: userName + random };
    }

    return { login: userName };
  }
  // private async findUser({ userName, email }: { userName: string }) {
  //   const user = await this.userRepository.f({ userName: userName });
  // }
}
