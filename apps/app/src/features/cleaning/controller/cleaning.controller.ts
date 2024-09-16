import { Controller, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { CleaningService } from '../cleaning.service';

@Controller('testing')
export class CleaningController {
  constructor(private readonly cleaningService: CleaningService) {}

  @ApiExcludeEndpoint()
  @Delete('all-data')
  async deleteAllData() {
    await this.cleaningService.cleanDB();
  }

  @ApiOperation({ summary: 'Удалить пользователя, его профиль и сессии' })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'UUID пользователя для удаления',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно удален',
  })
  @ApiResponse({
    status: 400,
    description: 'Неправильный UUID пользователя',
  })
  @ApiResponse({
    status: 500,
    description: 'что то не так',
  })
  @Delete(':userId')
  async deleteUserById(@Param('userId', ParseUUIDPipe) userId: string) {
    try {
      await this.cleaningService.deleteUserById({ id: userId });
    } catch (e) {
      throw new Error(e);
    }
  }
}
