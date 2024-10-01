import { Injectable } from '@nestjs/common';

import { EventData, EventsRepository, UpdateEventData } from './events.repository';

@Injectable()
export class EventsService {
  constructor(private eventsRepository: EventsRepository) {}

  async addEvent(data: EventData) {
    return await this.eventsRepository.addEvent(data);
  }

  async updateEvent(data: UpdateEventData) {
    await this.eventsRepository.updateEvent(data);
  }

  async getResolvedEvents() {
    return this.eventsRepository.getResolvedEvents();
  }

  async deleteEvent(parentId: string) {
    return this.eventsRepository.deleteEvent(parentId);
  }
}
