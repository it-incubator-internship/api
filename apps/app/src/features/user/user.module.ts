import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PrismaModule } from '../../common/database_module/prisma.module';
import { MailModule } from '../../providers/mailer/mail.module';
import { JwtAdapter } from '../../providers/jwt/jwt.adapter';

import { UserController } from './user/controller/user.controller';
import { UserService } from './user/service/user.service';
import { UserRepository } from './user/repository/user.repository';
import { SetNewPasswordHandler } from './auth/application/command/set-new-password.user.command';
import { LoginUserHandler } from './auth/application/command/login.user.command';
import { RefreshTokenHandler } from './auth/application/command/refresh-token.command';
import { LogoutUserHandler } from './auth/application/command/logout.user.command';
import { LocalStrategy } from './auth/strategies/local.auth.strategy';
import { RefreshStrategy } from './auth/strategies/refresh-token.auth.strategy';
import { DeletionSessionsHandler } from './auth/application/command/deletion-sessions.command';
import { SessionRepository } from './auth/repository/session.repository';
import { RegistrationUserHandler } from './auth/application/command/registrarion.user.command';
import { RegistrationEmailResendingHandler } from './auth/application/command/registration-email-resending.user.command';
import { RegistrationConfirmationHandler } from './auth/application/command/registration-confirmation.user.command';
import { PasswordRecoveryHandler } from './auth/application/command/password-recovery.user.command';
import { AuthController } from './auth/controller/auth.controller';
import { SendConfirmEmailWhenUserRegisteredEventHandler } from './auth/application/events-handlers/send-confirm-email-when-user-registered.event.handler';

const userRepositories = [UserRepository, SessionRepository];
const userService = [UserService];
const userCommands = [
  RegistrationUserHandler,
  RegistrationEmailResendingHandler,
  RegistrationConfirmationHandler,
  PasswordRecoveryHandler,
  SetNewPasswordHandler,
  LoginUserHandler,
  RefreshTokenHandler,
  LogoutUserHandler,
  DeletionSessionsHandler,
];
const events = [SendConfirmEmailWhenUserRegisteredEventHandler];
const stratigies = [LocalStrategy, RefreshStrategy];
const adapters = [JwtAdapter];

@Module({
  imports: [EventEmitterModule.forRoot(), MailModule, PrismaModule, CqrsModule, JwtModule.register({})],
  controllers: [UserController, AuthController],
  providers: [...userRepositories, ...userService, ...userCommands, ...stratigies, ...events, ...adapters],
})
export class UserModule {}
