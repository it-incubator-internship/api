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
    // const result = await this.userRepository.createUser(data);
    const newProfile = UserProfile.create({
      name: 'Lolik',
      email: 'data.data.email',
      password: '1234',
      confirmationCode: 'codecode',
    });
    let resul1;
    console.log('newProfile', newProfile);
    try {
      resul1 = await this.userRepository.createProfile(newProfile);
    } catch (e) {
      console.log(e);
    }

    console.log('+++++++++++++++++++++++++++++++++++++++++');
    console.log(resul1);
    console.log('+++++++++++++++++++++++++++++++++++++++++');

    return ObjResult.Ok(resul1);
  }

  async getAllUsers() {
    return this.userRepository.getAllUsers();
  }
}
