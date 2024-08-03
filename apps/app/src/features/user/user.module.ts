import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { UserRepository } from './repository/user.repository';
import { PrismaService } from '../../common/db/service/prisma-connection.service';

const commands = [];
const repositories = [UserRepository];

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, ...repositories, PrismaService],
})
export class UserModule {}
