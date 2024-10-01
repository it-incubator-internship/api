import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/database_module/prisma-connection.service';
import { $Enums } from '../../../../prisma/client';

import Entity = $Enums.Entity;
import EventStatus = $Enums.EventStatus;

export class EventData {
  parentId: string;
  entity: Entity;
  eventStatus: EventStatus;
  data?: NonNullable<unknown>;
}

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addEvent(data: EventData) {
    await this.prisma.events.create({
      data: {
        parentId: data.parentId,
        entity: data.entity,
        eventStatus: data.eventStatus,
      },
    });
  }

  async updateEvent(data: EventData) {
    await this.prisma.events.update({
      where: {
        parentId: data.parentId,
        entity: data.entity,
      },
      data: {
        data: data.data,
      },
    });
  }

  async getResolvedEvents() {
    return this.prisma.events.findMany({
      where: {
        eventStatus: EventStatus.READY,
      },
    });
  }
}
