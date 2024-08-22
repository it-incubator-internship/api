import bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { UserRepository } from '../../user/repository/user.repository';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      usernameField: 'email', // меняем ключ в body с 'username' на 'email'
    });
  }

  async validate(email: string, password: string) /*: Promise<any>*/ {
    if (typeof email !== 'string' || typeof password !== 'string') {
      return null;
    }

    const user = await this.userRepository.findUserByEmail({ email });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user!.passwordHash);

    if (!isMatch) {
      return null;
    }

    return { userId: user.id };
  }
}
