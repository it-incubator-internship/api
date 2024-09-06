import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../app/src/common/database_module/prisma-connection.service';

import { EntityHandler } from './entity.handler';

export enum EntityEnum {
  user = 'user',
  accountData = 'accountData',
  session = 'session',
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
    console.log('modelName in base repository (findFirstOne):', modelName);
    console.log('conditions in base repository (findFirstOne):', conditions);

    const searchResult = await this.prismaService[modelName as string].findFirst({
      where: conditions,
    });
    console.log('searchResult in base repository:', searchResult);

    if (!searchResult) {
      console.log('!searchResult');
      return null;
    }

    const entityClass = this.entityHandler.getEntityClass({ model: modelName as string });
    console.log('entityClass in base repository (findFirstOne):', entityClass);

    const result = entityClass!(searchResult);
    console.log('result in base repository (findFirstOne):', result);

    return result;
  }

  async findUniqueOne({
    modelName,
    conditions,
  }: {
    modelName: string;
    conditions: Record<string, any>;
  }): Promise<any | null> {
    console.log('modelName in base repository (findUniqueOne):', modelName);
    console.log('conditions in base repository (findUniqueOne):', conditions);

    const searchResult = await this.prismaService[modelName].findUnique({
      where: conditions,
    });
    console.log('searchResult in base repository:', searchResult);

    if (!searchResult) {
      console.log('!searchResult');
      return null;
    }

    const entityClass = this.entityHandler.getEntityClass({ model: modelName as string });
    console.log('entityClass in base repository (findFirstOne):', entityClass);

    const result = entityClass!(searchResult);
    console.log('result in base repository (findFirstOne):', result);

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
    console.log('modelName in base repository (updateOne):', modelName);
    console.log('conditions in base repository (updateOne):', conditions);
    console.log('data in base repository (updateOne):', data);

    const updatedEntity = await this.prismaService[modelName as string].update({
      where: conditions,
      data,
    });

    console.log('updatedEntity in base repository (updateOne):', updatedEntity);

    return updatedEntity;
  }
}
