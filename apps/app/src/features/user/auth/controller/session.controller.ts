import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OutputSession, SessionQueryRepository } from '../repository/session.query.repository';
import { MeSwagger } from '../decorators/swagger/me/me.swagger.decorator';
import { RefreshTokenGuard } from '../guards/refresh-token.auth.guard';
import { RefreshTokenInformation } from '../decorators/controller/refresh.token.information';

@ApiTags('sessions')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionQueryRepository: SessionQueryRepository) {}

  @UseGuards(RefreshTokenGuard)
  @Get('')
  @MeSwagger()
  async getAllUserSessions(
    @RefreshTokenInformation() data: { userId: string; deviceUuid: string },
  ): Promise<OutputSession[]> {
    return this.sessionQueryRepository.findAllSessionsByProfileId({ id: data.userId });
  }
}
