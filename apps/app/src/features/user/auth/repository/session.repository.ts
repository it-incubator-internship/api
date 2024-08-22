import { Injectable } from '@nestjs/common';

import { UserSession } from '../../user/class/session.fabric';
import { PrismaService } from '../../../../common/database_module/prisma-connection.service';

@Injectable()
export class SessionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSession(session: Omit<UserSession, 'id'>) {
    return this.prismaService.session.create({
      data: {
        profileId: session.profileId,
        deviceUuid: session.deviceUuid,
        deviceName: session.deviceName,
        ip: session.ip,
        lastActiveDate: session.lastActiveDate,
      },
    });
  }

  async updateSession(session: UserSession) {
    return this.prismaService.session.update({
      where: {
        id: session.id,
      },
      data: {
        lastActiveDate: session.lastActiveDate,
      },
    });
  }

  async findSessionByDeviceUuid({ deviceUuid }: { deviceUuid: string }): Promise<UserSession | null> {
    const session = await this.prismaService.session.findFirst({
      where: {
        deviceUuid: deviceUuid,
      },
    });

    if (!session) {
      return null;
    }

    return UserSession.convert(session);
  }

  async deleteSession({ id }: { id: string }) {
    await this.prismaService.session.delete({
      where: { id },
    });
  }

  async deleteAllSessions({ id }: { id: string }) {
    await this.prismaService.session.deleteMany({
      where: { profileId: id },
    });
  }
}
