import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { Session } from '../../../../../prisma/client';
import { OutputSession } from '../dto/output/all-sessions.output.dto';

@Injectable()
export class SessionQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllSessionsByProfileId({ id, deviceUuid }: { id: string; deviceUuid: string }): Promise<OutputSession[]> {
    const sessions = await this.prismaService.session.findMany({
      where: { profileId: id },
    });

    return sessions.map((session) => this.sessionToOutput(session, deviceUuid));
  }

  private sessionToOutput(session: Session, deviceUuid: string): OutputSession {
    return {
      sessionId: session.deviceUuid,
      current: session.deviceUuid === deviceUuid ? true : false,
      userId: session.profileId,
      deviceName: session.deviceName,
      ip: session.ip,
      lastActiveDate: session.lastActiveDate,
    };
  }
}
