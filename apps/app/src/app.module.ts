import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './common/db/service/prisma-connection.service';
import { UserModule } from './features/user/user.module';
import { configuration } from './common/settings/configuration';
import { Environments } from './common/settings/env_validate/env-class-validator';
import { getEnvFilePath, isEnvFileIgnored } from './common/settings/determinate-env-path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const path = getEnvFilePath(process.env.NODE_ENV as Environments);
        console.log('Env file path:', path);
        return path;
      })(),
      ignoreEnvFile: (() => {
        const ignore = isEnvFileIgnored(process.env.NODE_ENV as Environments);
        console.log('Ignore env file:', ignore);
        return ignore;
      })(),
      load: [configuration],
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
