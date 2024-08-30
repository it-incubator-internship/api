import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { UserInformationOutputDto } from '../../auth/dto/output/information.output.dto';

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserById({ id }: { id: string }): Promise<UserInformationOutputDto | null> {
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

    return user;
  }
}
