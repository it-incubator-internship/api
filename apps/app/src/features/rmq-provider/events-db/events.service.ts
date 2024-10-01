import { Injectable } from '@nestjs/common';

import { EventData, EventsRepository } from './events.repository';

@Injectable()
export class EventsService {
  constructor(private eventsRepository: EventsRepository) {}

  async addEvent(data: EventData) {
    await this.eventsRepository.addEvent(data);
  }

  async updateEvent(data: EventData) {
    await this.eventsRepository.updateEvent(data);
  }

  async getResolvedEvents() {
    return await this.eventsRepository.getResolvedEvents();
  }
}
