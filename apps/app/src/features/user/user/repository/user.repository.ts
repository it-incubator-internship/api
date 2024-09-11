import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { Prisma, User } from '../../../../../prisma/client';
import { EntityFactory } from '../domain/account-data.entity';
import { BaseRepository } from '../../../../../../common/repository/base.repository';
import { EntityHandler } from '../../../../../../common/repository/entity.handler';

@Injectable()
export class UserRepository extends BaseRepository {
  constructor(prismaService: PrismaService, entityHandler: EntityHandler) {
    super(prismaService, entityHandler);
  }

  async createUser(user: Prisma.UserCreateInput) {
    const newUser: User = await this.prismaService.user.create({ data: user });
    return EntityFactory.createUser(newUser);
  }

  async createAccountData(userAccountData: Prisma.AccountDataCreateInput) {
    const accountData = await this.prismaService.accountData.create({ data: userAccountData });
    return EntityFactory.createAccountData(accountData);
  }

  async createProfile(userProfile: Prisma.ProfileCreateInput) {
    const profile = await this.prismaService.profile.create({ data: userProfile });
    return EntityFactory.createProfile(profile);
  }

  async findAllUsers() {
    return this.prismaService.user.findMany();
  }

  async findUserByEmailOrName({ email, name }: { email: string; name: string }) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: email,
              mode: 'insensitive',
            },
          },
          {
            name: {
              equals: name,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    if (!user) return null;

    return EntityFactory.createUser(user);
  }
}
