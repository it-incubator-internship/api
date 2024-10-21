import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { EventsType } from '../application/command/send.event.command';
import { EventDocument, EventEntity } from '../schema/events.schema';

@Injectable()
export class EventRepository {
  constructor(@InjectModel(EventEntity.name) private eventModel: Model<EventDocument>) {}

  async create(eventEntity: EventEntity): Promise<EventEntity> {
    const eventDocument = new this.eventModel(eventEntity);
    return await eventDocument.save();
  }

  async findEvents(): Promise<EventsType[] | []> {
    const events = await this.eventModel.find();

    const transformedResults = events.map((u) => ({
      id: u._id.toString(), // Преобразуем _id в строку
      success: u.success,
      type: u.type,
      eventId: u.eventId,
      payload: {
        smallUrl: u.payload.smallUrl,
        originalUrl: u.payload.originalUrl,
      },
    }));

    return transformedResults;
  }

  async deleteEvent({ id }: { id: string }): Promise<void> {
    try {
      await this.eventModel.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    } catch {
      console.error('error in event repository (deleteEvent)');
    }

    return;
  }
}
