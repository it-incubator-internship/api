import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PrismaModule } from '../../common/database_module/prisma.module';
import { UserModule } from '../user/user.module';
import { RmqModule } from '../rmq-provider/rmq.module';

import { FileController } from './controller/file.controller';
import { DeleteAvatarUserHandler } from './application/command/delete.avatar.user.command';
import { UploadAvatarUserHandler } from './application/command/upload.avatar.user.command';

const commands = [DeleteAvatarUserHandler, UploadAvatarUserHandler];

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MULTICAST_EXCHANGE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://navaibeadmin:navaibeadmin@91.108.243.169:5672/test_vhost'],
          queue: 'multicast_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    PrismaModule,
    UserModule,
    RmqModule,
  ],
  providers: [...commands],
  controllers: [FileController],
  exports: [],
})
export class FileModule {}
