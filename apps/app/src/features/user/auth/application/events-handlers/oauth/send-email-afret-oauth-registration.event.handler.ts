import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserOauthRegisreationEvent } from '../../events/user-oauth-regisreation.event';
import { MailService } from '../../../../../../providers/mailer/mail.service';

@EventsHandler(UserOauthRegisreationEvent)
export class SendEmailAfterOauthRegistrationEventHandler implements IEventHandler<UserOauthRegisreationEvent> {
  constructor(private readonly mailService: MailService) {}

  handle(event: UserOauthRegisreationEvent): any {
    this.mailService
      .sendUerOauthRegistration({
        email: event.email,
        login: event.login,
        service: event.service,
      })
      .catch((error) => console.log(error));
  }
}
