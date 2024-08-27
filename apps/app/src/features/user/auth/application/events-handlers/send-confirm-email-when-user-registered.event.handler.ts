import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MailService } from '../../../../../providers/mailer/mail.service';
import { UserRegistrationEvent } from '../../../user/domain/events/user-registration.event';

@EventsHandler(UserRegistrationEvent)
export class SendConfirmEmailWhenUserRegisteredEventHandler implements IEventHandler<UserRegistrationEvent> {
  constructor(private readonly mailService: MailService) {}

  handle(event: UserRegistrationEvent): any {
    console.log('сработал отправщик почты');
    this.mailService.sendUserConfirmation({
      email: event.email,
      login: event.login,
      token: event.confirmationCode,
    });
    console.log('отправка произошла');
  }
}
