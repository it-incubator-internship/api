import { Controller, Delete } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { UserRepository } from '../../user/user/repository/user.repository';
import { SessionRepository } from '../../user/auth/repository/session.repository';

//TODO вынести в отдельный модуль
@ApiExcludeController()
@Controller('testing')
export class CleaningController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  @Delete('all-data')
  async deleteAllData() {
    await this.sessionRepository.deleteAllSessions();
    await this.userRepository.deleteAllUsers();
  }
}
