import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { UserRepository } from '../../user/repository/user.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository,) {
    super({
      usernameField: 'email' // меняем ключ в body с 'username' на 'email'
    });
  }

  async validate(email: string, password: string)/*: Promise<any>*/ {
  console.log('console.log in local auth strategy')
  console.log('email in local auth strategy:', email)
  console.log('password in local auth strategy:', password)

    const user = await this.userRepository.findUserByEmail({email});
    console.log('user in local auth strategy:', user)

    if (!user) {
      console.log('!user')
      return ObjResult.Err(
        new BadRequestError('The email are incorrect', [{ message: 'The email or password are incorrect. Try again please', field: 'email or password' }]),
      );
    }

    const isMatch = await bcrypt.compare(password, user!.passwordHash)
    console.log('isMatch in local auth strategy:', isMatch)

    if (!isMatch) {
      console.log('!isMatch')
      return ObjResult.Err(
        new BadRequestError('The password are incorrect', [{ message: 'The email or password are incorrect. Try again please', field: 'email or password' }]),
      );
    }

    return ObjResult.Ok();
  }
}
