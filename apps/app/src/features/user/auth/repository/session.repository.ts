import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { UserSession } from '../../user/domain/session.fabric';

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

  async updateLastActiveDataInSession(session: UserSession) {
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
