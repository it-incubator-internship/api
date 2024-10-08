import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { PrismaModule } from '../../common/database_module/prisma.module';
import { UserModule } from '../user/user.module';
import { RmqModule } from '../rmq-provider/rmq.module';
import { ConfigurationType } from '../../common/settings/configuration';

import { FileController } from './controller/file.controller';
import { DeleteAvatarUserHandler } from './application/command/delete.avatar.user.command';
import { UploadAvatarUserHandler } from './application/command/upload.avatar.user.command';

const commands = [DeleteAvatarUserHandler, UploadAvatarUserHandler];

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MULTICAST_EXCHANGE',
        useFactory: (configService: ConfigService<ConfigurationType, true>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('apiSettings.RMQ_HOST', { infer: true }) as string],
            queue: 'multicast_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
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
