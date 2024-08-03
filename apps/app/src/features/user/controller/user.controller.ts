import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() postData: { email: string; name: string }) {
    await this.userService.createUser({ data: postData });
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
