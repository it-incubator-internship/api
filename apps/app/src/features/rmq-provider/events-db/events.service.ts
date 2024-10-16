import { Injectable } from '@nestjs/common';

import { EventData, EventsRepository, UpdateEventData } from './events.repository';

@Injectable()
export class EventsService {
  constructor(private eventsRepository: EventsRepository) {}

  async addEvent(data: EventData) {
    return await this.eventsRepository.addEvent(data);
  }

  async updateEvent(data: UpdateEventData) {
    console.log('console.log in events.service (updateEvent)');
    console.log('data in events.service (updateEvent):', data);
    await this.eventsRepository.updateEvent(data);
  }

  async getResolvedEvents() {
    return this.eventsRepository.getResolvedEvents();
  }

  async deleteEvent(eventId: string) {
    return this.eventsRepository.deleteEvent(eventId);
  }
}
