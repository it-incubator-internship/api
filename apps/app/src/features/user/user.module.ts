import { Module } from '@nestjs/common';
import { UserController } from './user/controller/user.controller';
import { UserService } from './user/service/user.service';
import { UserRepository } from './user/repository/user.repository';
import { PrismaService } from '../../common/db/service/prisma-connection.service';

const userCommands = [];
const userRepositories = [UserRepository];
const userService = [UserService];

@Module({
  imports: [],
  controllers: [UserController],
  providers: [...userRepositories, ...userService, PrismaService],
})
export class UserModule {}
