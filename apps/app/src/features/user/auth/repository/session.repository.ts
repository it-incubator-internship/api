import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { Prisma } from '../../../../../prisma/client';
// import { SessionEntityNEW } from '../../user/domain/account-data.entity';
import { BaseRepository } from '../../../../../../common/repository/base.repository';
import { EntityHandler } from '../../../../../../common/repository/entity.handler';

@Injectable()
export class SessionRepository extends BaseRepository {
  constructor(prismaService: PrismaService, entityHandler: EntityHandler) {
    super(prismaService, entityHandler);
  }

  async createSession(session: Prisma.SessionCreateInput) {
    return this.prismaService.session.create({ data: session });
  }

  // async updateLastActiveDataInSession(session: SessionEntityNEW) {
  //   return this.prismaService.session.update({
  //     where: {
  //       id: session.id,
  //     },
  //     data: {
  //       lastActiveDate: session.lastActiveDate,
  //     },
  //   });
  // }

  async deleteSession({ id }: { id: string }) {
    await this.prismaService.session.delete({
      where: { id },
    });
  }

  async deleteSessionByDeviceUuid({ deviceUuid }: { deviceUuid: string }) {
    await this.prismaService.session.delete({
      where: { deviceUuid },
    });
  }

  async deleteAllSessionsByProfileId({ id }: { id: string }) {
    await this.prismaService.session.deleteMany({
      where: { profileId: id },
    });
  }
}
