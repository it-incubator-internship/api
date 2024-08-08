import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ErrorResulter } from '../../../../../../common/utils/result/object-result';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() postData: { email: string; name: string }) {
    console.log(postData);
    const result = await this.userService.createUser({ data: postData });

    if (!result.isSuccess) return ErrorResulter.proccesError(result.error);

    return result.value;
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
