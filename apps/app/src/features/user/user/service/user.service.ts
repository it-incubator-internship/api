import { randomUUID } from 'crypto';

import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

import { UserRepository } from '../repository/user.repository';
import { ObjResult } from '../../../../../../common/utils/result/object-result';
import { BadRequestError } from '../../../../../../common/utils/result/custom-error';
import { UserEntity } from '../domain/user.fabric';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: any) {
    if (!data) return ObjResult.Err(new BadRequestError('test is required', [{ message: '', field: '' }]));

    const confirmationCode = randomUUID();

    const passwordHash = bcrypt.hashSync(data.password, 10);

    const dataForCreating = UserEntity.create({
      name: data.name as string,
      email: data.email as string,
      passwordHash: passwordHash,
      accountData: { confirmationCode },
    });

    let result;

    try {
      result = await this.userRepository.createUser(dataForCreating);
    } catch (e) {
      console.log(e);
    }

    return ObjResult.Ok(result);
  }

  async getAllUsers() {
    return this.userRepository.findAllUsers();
  }
}
