import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { UserService } from '../service/user.service';

@ApiExcludeController()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() postData: { email: string; name: string; password: string }) {
    const result = await this.userService.createUser(postData);

    if (!result.isSuccess) throw result.error;

    return result.value;
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
