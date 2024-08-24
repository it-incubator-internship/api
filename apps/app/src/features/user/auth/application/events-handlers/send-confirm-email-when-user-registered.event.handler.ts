import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserRegistrationEvent } from '../../../user/class/events/user-registration.event';
import { MailService } from '../../../../../providers/mailer/mail.service';

@EventsHandler(UserRegistrationEvent)
export class SendConfirmEmailWhenUserRegisteredEventHandler implements IEventHandler<UserRegistrationEvent> {
  constructor(private readonly mailService: MailService) {}

  handle(event: UserRegistrationEvent): any {
    this.mailService.sendUserConfirmation({
      email: event.email,
      login: event.login,
      token: event.confirmationCode,
    });
  }
}
