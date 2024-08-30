import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
// import { UserEntity } from '../domain/user.fabric';
// import { UserAccountData } from '../domain/accoun-data.fabric';
// import { User } from '../../../../../prisma/client';

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserById({ id }: { id: string }) /*: Promise<UserEntity | null>*/ {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    console.log('user in user query repoditory:', user);

    return user;
  }
}
