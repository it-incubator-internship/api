import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { Environments } from './common/settings/env_validate/env-class-validator';
import { getEnvFilePath, isEnvFileIgnored } from './common/settings/determinate-env-path';
import { configuration } from './common/settings/configuration';

const environment = process.env.NODE_ENV as Environments;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(environment),
      ignoreEnvFile: isEnvFileIgnored(environment),
      load: [configuration],
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
