import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../app/src/common/database_module/prisma-connection.service';

import { EntityHandler } from './entity.handler';

export enum EntityEnum {
  user = 'user',
  accountData = 'accountData',
  session = 'session',
  profile = 'profile',
}

@Injectable()
export class BaseRepository {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly entityHandler: EntityHandler,
  ) {}

  async findFirstOne({
    modelName,
    conditions,
  }: {
    modelName: EntityEnum;
    conditions: Record<string, any>;
  }): Promise<any | null> {
    const searchResult = await this.prismaService[modelName as string].findFirst({
      where: conditions,
    });

    if (!searchResult) {
      return null;
    }

    const result = this.entityHandler.getEntityClass({ model: modelName as string, entity: searchResult });

    return result;
  }

  async findUniqueOne({
    modelName,
    conditions,
  }: {
    modelName: string;
    conditions: Record<string, any>;
  }): Promise<any | null> {
    const searchResult = await this.prismaService[modelName].findUnique({
      where: conditions,
    });

    if (!searchResult) {
      return null;
    }

    const result = this.entityHandler.getEntityClass({ model: modelName as string, entity: searchResult });

    return result;
  }

  async updateOne({
    modelName,
    conditions,
    data,
  }: {
    modelName: EntityEnum;
    conditions: Record<string, any>;
    data: Record<string, any>;
  }): Promise<any> {
    const updatedResult = await this.prismaService[modelName as string].update({
      where: conditions,
      data: data,
    });

    if (!updatedResult) {
      return null;
    }

    const result = this.entityHandler.getEntityClass({ model: modelName as string, entity: updatedResult });

    return result;
  }
}
