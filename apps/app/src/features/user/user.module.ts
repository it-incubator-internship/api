import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user/controller/user.controller';
import { AuthController } from './auth/controller/auth.controller';
import { UserService } from './user/service/user.service';
import { UserRepository } from './user/repository/user.repository';
import { EmailAdapter } from './auth/email.adapter/email.adapter';
import { RegistrationUserHandler } from './auth/command/registrarion.user.command';
import { RegistrationEmailResendingHandler } from './auth/command/registration-email-resending.user.command';
import { RegistrationConfirmationHandler } from './auth/command/registration-confirmation.user.command';
import { PasswordRecoveryHandler } from './auth/command/password-recovery.user.command';
import { SetNewPasswordHandler } from './auth/command/set-new-password.user.command';
import { LoginUserHandler } from './auth/command/login.user.command';
import { RefreshTokenHandler } from './auth/command/refresh-token.command';
import { LogoutUserHandler } from './auth/command/logout.user.command';
import { LocalStrategy } from './auth/strategies/local.auth.strategy';
import { RefreshStrategy } from './auth/strategies/refresh-token.auth.strategy';
import { DeletionSessionsHandler } from './auth/command/deletion-sessions.command';
import { SessionRepository } from './auth/repository/session.repository';
import { PrismaModule } from '../../common/database_module/prisma.module';

const userCommands = [];
const userRepositories = [UserRepository, SessionRepository];
const userService = [UserService];
const userCcommands = [
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
// const sessionCcommands = [
//   RegistrationUserHandler,
//   RegistrationEmailResendingHandler,
//   RegistrationConfirmationHandler,
//   PasswordRecoveryHandler,
//   SetNewPasswordHandler,
//   LoginUserHandler,
//   RefreshTokenHandler,
//   LogoutUserHandler,
//   DeletionSessionsHandler,
// ];
const stratigies = [
  LocalStrategy,
  RefreshStrategy,
]
const adapters = [EmailAdapter]

@Module({
  imports: [PrismaModule, CqrsModule, JwtModule.register({})],
  controllers: [UserController, AuthController],
  providers: [...userRepositories, ...userService, ...userCcommands, ...stratigies, ...adapters],
})
export class UserModule {}
