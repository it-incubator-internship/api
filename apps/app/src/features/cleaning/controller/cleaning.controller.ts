import { Controller, Delete } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { CleaningService } from '../cleaning.service';

@ApiExcludeController()
@Controller('testing')
export class CleaningController {
  constructor(private readonly cleaningService: CleaningService) {}

  @Delete('all-data')
  async deleteAllData() {
    await this.cleaningService.cleanDB();
  }
}
