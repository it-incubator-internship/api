import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserRegistrationEvent } from '../../../user/class/events/user-registration.event';

@EventsHandler(UserRegistrationEvent)
export class SendConfirmEmailWhenUserRegisteredEventHandler implements IEventHandler<UserRegistrationEvent> {
  constructor() {}

  handle(event: UserRegistrationEvent): any {
    console.log(event);
  }
}
