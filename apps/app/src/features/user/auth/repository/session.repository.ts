import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { Prisma } from '../../../../../prisma/client';
import { EntityFactory, SessionEntityNEW } from '../../user/domain/account-data.entity';

@Injectable()
export class SessionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSession(session: Prisma.SessionCreateInput) {
    return this.prismaService.session.create({ data: session });
  }

  async updateLastActiveDataInSession(session: SessionEntityNEW) {
    return this.prismaService.session.update({
      where: {
        id: session.id,
      },
      data: {
        lastActiveDate: session.lastActiveDate,
      },
    });
  }

  async findSessionByDeviceUuid({ deviceUuid }: { deviceUuid: string }): Promise<SessionEntityNEW | null> {
    const session = await this.prismaService.session.findFirst({
      where: {
        deviceUuid: deviceUuid,
      },
    });

    if (!session) {
      return null;
    }

    return EntityFactory.createSession(session);
  }

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
