import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { Session } from '../../../../../prisma/client';
import { OutputSession } from '../dto/output/all-sessions.output.dto';

@Injectable()
export class SessionQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllSessionsByProfileId({ id }: { id: string }): Promise<OutputSession[]> {
    const sessions = await this.prismaService.session.findMany({
      where: { profileId: id },
    });

    return sessions.map((session) => this.sessionToOutput(session));
  }

  private sessionToOutput(session: Session): OutputSession {
    return {
      sessionId: session.deviceUuid,
      userId: session.profileId,
      deviceName: session.deviceName,
      ip: session.ip,
      lastActiveDate: session.lastActiveDate,
    };
  }
}
