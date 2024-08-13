import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { randomUUID } from 'crypto';
import { UserEntity } from '../class/user.fabric';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: { data: any }) {
    console.log('data in user service:', data);
    if (!data /*.test*/) return ObjResult.Err(new BadRequestError('test is required', 'test'));
    console.log('data in user service:', data);

    // const result = await this.userRepository.createUser(data);
    // const newProfile = UserEntity.create({
    //   name: 'Lolik',
    //   email: 'data.data.email',
    //   password: '1234',
    //   confirmationCode: 'codecode',
    // });

    const confirmationCode = randomUUID();
    console.log('confirmationCode in user service:', confirmationCode);

    const dataForCreating = UserEntity.create({
      name: data.data.name as string,
      email: data.data.email as string,
      password: data.data.password as string,
      accountData: { confirmationCode },
    });

    console.log('dataForCreating in user service:', dataForCreating);

    let result;
    // console.log('newProfile', newProfile);
    try {
      result = await this.userRepository.createProfile(/* newProfile */ dataForCreating);
    } catch (e) {
      console.log(e);
    }

    // console.log('+++++++++++++++++++++++++++++++++++++++++');
    console.log('result in user service:', result);
    // console.log('+++++++++++++++++++++++++++++++++++++++++');

    return ObjResult.Ok(result);
  }

  async getAllUsers() {
    return this.userRepository.getAllUsers();
  }
}
