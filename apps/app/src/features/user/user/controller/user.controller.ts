import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { UserQueryRepository } from '../repository/user.query.repository';
import { NotFoundError } from '../../../../../../common/utils/result/custom-error';
import { ProfileUserInputModel } from '../dto/input/profile.user.dto';
import { UpdateProfileUserCommand } from '../application/command/update.profile.user.command';
import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard';
import { GetUserProfileSwagger } from '../decorators/swagger/get-user-profile/get-user-profile.swagger.decorator';
import { UpdateUserProfileSwagger } from '../decorators/swagger/update-user-profile/update-user-profile.swagger.decorator';
import { ProfileOwnerGuard } from '../guards/profile.owner.guard';
import { UserProfileOutputDto } from '../dto/output/user.profile.output.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private commandBus: CommandBus,
    private userRepository: UserQueryRepository,
  ) {}

  @Get('profile/:id')
  @GetUserProfileSwagger()
  async getUserProfileById(@Param('id') userId: string): Promise<UserProfileOutputDto> {
    const userProfile = await this.userRepository.findUserProfileById({ id: userId });

    if (!userProfile) {
      throw new NotFoundError('userProfile not found');
    }

    return userProfile;
  }

  @UseGuards(JwtAuthGuard, ProfileOwnerGuard)
  @Put('profile/:id')
  @UpdateUserProfileSwagger()
  async updateProfile(@Param('id') userIdFromParam: string, @Body() inputModel: ProfileUserInputModel) {
    const result = await this.commandBus.execute(new UpdateProfileUserCommand({ ...inputModel, userIdFromParam }));

    if (!result.isSuccess) throw result.error;
  }
}
