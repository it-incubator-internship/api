import { Module } from '@nestjs/common';
import { PrismaService } from './prisma-connection.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
