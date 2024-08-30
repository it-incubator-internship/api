import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { AuthMeOutput } from '../../auth/dto/output/information.output.dto';

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserMeInformation({ id }: { id: string }): Promise<AuthMeOutput | null> {
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

    if (!user) return null;

    return {
      userId: user.id,
      email: user.email,
      userName: user.name,
    };
  }
}
