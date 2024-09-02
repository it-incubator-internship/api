import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MailService } from '../../../../../providers/mailer/mail.service';
import { UserNewPasswordRegCodeEvent } from '../../../user/domain/events/user-new-password-reg-code.event';

@EventsHandler(UserNewPasswordRegCodeEvent)
export class SendNewPasswordRecoveryEmailWhenUserAskIt implements IEventHandler<UserNewPasswordRegCodeEvent> {
  constructor(private readonly mailService: MailService) {}

  handle(event: UserNewPasswordRegCodeEvent): any {
    console.log('сработало');
    this.mailService.sendPasswordRecovery({
      email: event.email,
      login: event.login,
      recoveryCode: event.confirmationCode,
    });
  }
}
