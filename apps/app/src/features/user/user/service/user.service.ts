import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { UserProfile } from '../class/user.class';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: { data: any }) {
    if (!data.data.test) return ObjResult.Err(new BadRequestError('test is required', 'test'));
    console.log(data);
    const result = await this.userRepository.createUser(data);
    const newUser = UserProfile.create({ name: 'Lolik', email: 'lol@mai.com' });
    const result = await this.userRepository.save(newUser);

    return ObjResult.Ok(result);
  }

  async getAllUsers() {
    return this.userRepository.getAllUsers();
  }
}
