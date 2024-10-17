import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';

import { JwtAdapter } from '../../providers/jwt/jwt.adapter';
import { MailModule } from '../../providers/mailer/mail.module';
import { PrismaModule } from '../../common/database_module/prisma.module';
import { EntityHandler } from '../../../../common/repository/entity.handler';
import { LocalizationModule } from '../localization/localization.module';
import { RmqModule } from '../rmq-provider/rmq.module';

import { UserRepository } from './user/repository/user.repository';
import { SessionRepository } from './auth/repository/session.repository';
import { RegistrationUserHandler } from './auth/application/command/registrarion.user.command';
import { RegistrationEmailResendingHandler } from './auth/application/command/registration-email-resending.user.command';
import { RegistrationConfirmationHandler } from './auth/application/command/registration-confirmation.user.command';
import { PasswordRecoveryHandler } from './auth/application/command/password-recovery.user.command';
import { SetNewPasswordHandler } from './auth/application/command/set-new-password.user.command';
import { LoginUserHandler } from './auth/application/command/login.user.command';
import { RefreshTokenHandler } from './auth/application/command/refresh-token.command';
import { LogoutUserHandler } from './auth/application/command/logout.user.command';
import { DeletionSessionsHandler } from './auth/application/command/session/deletion-sessions.command';
import { SendConfirmEmailWhenUserRegisteredEventHandler } from './auth/application/events-handlers/send-confirm-email-when-user-registered.event.handler';
import { LocalStrategy } from './auth/strategies/local.auth.strategy';
import { RefreshStrategy } from './auth/strategies/refresh-token.auth.strategy';
import { AuthController } from './auth/controller/auth.controller';
import { AuthGoogleController } from './auth/controller/auth.google.controller';
import { GithubOauthController } from './auth/controller/auth.github.controller';
import { GithubOauthStrategy } from './auth/controller/passport/github/github-oauth.strategy';
import { GoogleAuthStrategy } from './auth/controller/passport/google/google.auth.strategy';
import { RegistrationUserByGoogleHandler } from './auth/application/command/registration-by-google.user.command';
import { GoogleAuthHandler } from './auth/application/command/oauth/google.auth.command';
import { OauthService } from './auth/application/service/oauth.service';
import { GithubOauthHandler } from './auth/application/command/oauth/github-oauth.command';
import { UserQueryRepository } from './user/repository/user.query.repository';
import { JwtAuthStrategy } from './auth/strategies/jwt.auth.strategy';
import { SendEmailAfterOauthRegistrationEventHandler } from './auth/application/events-handlers/oauth/send-email-afret-oauth-registration.event.handler';
import { RecaptchaAuthGuard } from './auth/guards/recaptcha.auth.guard';
import { SendNewPasswordRecoveryEmailWhenUserAskIt } from './auth/application/events-handlers/send-password-change-code-when-user-ask-it.event.handler';
import { SendNewConfirmEmailWhenUserAskItEventHandler } from './auth/application/events-handlers/send-new-confirm-email-when-user-ask-it.event.handler';
import { SessionQueryRepository } from './auth/repository/session.query.repository';
import { SessionController } from './auth/controller/session.controller';
import { TerminateSessionByIdHandler } from './auth/application/command/session/terminate-session-by-id.command';
import { UserController } from './user/controller/user.controller';
import { UpdateProfileUserCommandHandler } from './user/application/command/update.profile.user.command';
import { ProfileOwnerGuard } from './user/guards/profile.owner.guard';
import { CodeValidationHandler } from './auth/application/command/code-validation.user.command';
// import { ClientsModule, Transport } from '@nestjs/microservices';

const userRepositories = [UserRepository, UserQueryRepository];
const sessionRepositories = [SessionRepository, SessionQueryRepository];
const userService = [OauthService];
const userCommands = [
  RegistrationUserHandler,
  RegistrationEmailResendingHandler,
  RegistrationConfirmationHandler,
  SendNewConfirmEmailWhenUserAskItEventHandler,
  SendNewPasswordRecoveryEmailWhenUserAskIt,
  PasswordRecoveryHandler,
  SetNewPasswordHandler,
  LoginUserHandler,
  RefreshTokenHandler,
  LogoutUserHandler,
  DeletionSessionsHandler,
  GoogleAuthHandler,
  GithubOauthHandler,
  RegistrationUserByGoogleHandler,
  UpdateProfileUserCommandHandler,
  CodeValidationHandler,
];
const sessionCommands = [TerminateSessionByIdHandler];
const events = [SendConfirmEmailWhenUserRegisteredEventHandler, SendEmailAfterOauthRegistrationEventHandler];
const strategies = [
  LocalStrategy,
  RefreshStrategy,
  GoogleAuthStrategy,
  GithubOauthStrategy,
  JwtAuthStrategy,
  RecaptchaAuthGuard,
  ProfileOwnerGuard,
];
const adapters = [JwtAdapter];

@Module({
  imports: [
    RmqModule,
    HttpModule,
    EventEmitterModule.forRoot(),
    MailModule,
    PrismaModule,
    LocalizationModule,
    CqrsModule,
    JwtModule.register({}),
    ThrottlerModule.forRoot([
      {
        ttl: 10000, // время
        limit: 5, // количество попыток
      },
    ]),
  ],
  controllers: [AuthController, AuthGoogleController, GithubOauthController, SessionController, UserController],
  providers: [
    ...userRepositories,
    ...sessionRepositories,
    ...sessionCommands,
    ...userService,
    ...userCommands,
    ...strategies,
    ...events,
    ...adapters,
    EntityHandler,
  ],
  exports: [UserRepository],
})
export class UserModule {}
