import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MailService } from '../../../../../providers/mailer/mail.service';
import { UserResendRegCodeEvent } from '../../../user/domain/events/user-resend-reg-code.event';

@EventsHandler(UserResendRegCodeEvent)
export class SendNewConfirmEmailWhenUserAskItEventHandler implements IEventHandler<UserResendRegCodeEvent> {
  constructor(private readonly mailService: MailService) {}

  handle(event: UserResendRegCodeEvent): any {
    this.mailService.sendUserConfirmation({
      email: event.email,
      login: event.login,
      token: event.confirmationCode,
    });
  }
}
