import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/database_module/prisma.module';
import { UserModule } from '../user/user.module';
import { RmqModule } from '../rmq-provider/rmq.module';

import { FileController } from './controller/file.controller';
import { DeleteAvatarUserHandler } from './application/command/delete.avatar.user.command';
import { UploadAvatarUserHandler } from './application/command/upload.avatar.user.command';

const commands = [DeleteAvatarUserHandler, UploadAvatarUserHandler];

@Module({
  imports: [PrismaModule, UserModule, RmqModule],
  providers: [...commands],
  controllers: [FileController],
  exports: [],
})
export class FileModule {}
