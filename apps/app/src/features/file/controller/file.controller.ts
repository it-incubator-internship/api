// import { CommandBus } from '@nestjs/cqrs';
// import { ApiTags } from '@nestjs/swagger';
import {
  /* Body, */ Controller,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Post,
  UploadedFile /* , UseGuards */,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

// import { UserQueryRepository } from '../repository/user.query.repository';
// import { NotFoundError } from '../../../../../../common/utils/result/custom-error';
// import { ProfileUserInputModel } from '../dto/input/profile.user.dto';
// import { UpdateProfileUserCommand } from '../application/command/update.profile.user.command';
// import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard';
// import { GetUserProfileSwagger } from '../decorators/swagger/get-user-profile/get-user-profile.swagger.decorator';
// import { UpdateUserProfileSwagger } from '../decorators/swagger/update-user-profile/update-user-profile.swagger.decorator';
// import { ProfileOwnerGuard } from '../guards/profile.owner.guard';
// import { UserProfileOutputDto } from '../dto/output/user.profile.output.dto';

// @ApiTags('user')
@Controller('file')
export class FileController {
  constructor() {} // private userRepository: UserQueryRepository, // private commandBus: CommandBus,

  // @UseGuards(JwtAuthGuard, ProfileOwnerGuard)
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  // @UpdateUserProfileSwagger()
  async uploadAvatar(
    // @UploadedFile(
    //   new ParseFilePipeBuilder()
    //     .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
    //     .addMaxSizeValidator({ maxSize: 10485760 })
    //     .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    // )
    // file: Express.Multer.File,
    @Param('id', ParseUUIDPipe) userIdFromParam: string /* , @Body() inputModel: ProfileUserInputModel */,
  ) {
    console.log('console.log in file controller');
    console.log('file in file controller:', file);
    console.log('userIdFromParam in file controller:', userIdFromParam);
    // const result = await this.commandBus.execute(
    //   new UpdateProfileUserCommand({ ...inputModel, userId: userIdFromParam }),
    // );

    // if (!result.isSuccess) throw result.error;
  }
}
