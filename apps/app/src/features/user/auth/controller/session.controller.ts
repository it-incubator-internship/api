import { Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';

import { SessionQueryRepository } from '../repository/session.query.repository';
import { RefreshTokenGuard } from '../guards/refresh-token.auth.guard';
import { RefreshTokenInformation } from '../decorators/controller/refresh.token.information';
import {
  TerminateSessionByIdCommand,
  TerminateType,
} from '../application/command/session/terminate-session-by-id.command';
import { DeleteCurrentSessionSwagger } from '../decorators/swagger/sessions/delete-current-session.swagger.decorator';
import { DeleteOtherSessionsSwagger } from '../decorators/swagger/sessions/delete-other-sessions.swagger.decorator';
import { GetAllUserSessionsSwaggerDecorator } from '../decorators/swagger/sessions/get-all-user-sessions.swagger.decorator';
import { OutputSession } from '../dto/output/all-sessions.output.dto';

@ApiTags('sessions')
@Controller('sessions')
export class SessionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly sessionQueryRepository: SessionQueryRepository,
  ) {}

  @UseGuards(RefreshTokenGuard)
  @Get('')
  @GetAllUserSessionsSwaggerDecorator()
  async getAllUserSessions(
    @RefreshTokenInformation() data: { userId: string; deviceUuid: string },
  ): Promise<OutputSession[]> {
    return this.sessionQueryRepository.findAllSessionsByProfileId({ id: data.userId });
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  @Delete('/other')
  @DeleteOtherSessionsSwagger()
  async terminateOtherSession(@RefreshTokenInformation() data: { userId: string; deviceUuid: string }) {
    const result = await this.commandBus.execute(
      new TerminateSessionByIdCommand({
        commandType: TerminateType.other,
        deviceUuid: data.deviceUuid,
        userId: data.userId,
      }),
    );

    if (!result.isSuccess) throw result.error;
  }

  @UseGuards(RefreshTokenGuard)
  @Delete(':deviceUuid')
  @HttpCode(204)
  @DeleteCurrentSessionSwagger()
  async terminateCurrentSession(
    @RefreshTokenInformation() data: { userId: string; deviceUuid: string },
    @Param('deviceUuid', ParseUUIDPipe) deviceUuid: string,
  ) {
    const result = await this.commandBus.execute(
      new TerminateSessionByIdCommand({ commandType: TerminateType.current, deviceUuid, userId: data.userId }),
    );

    if (!result.isSuccess) throw result.error;
  }
}
