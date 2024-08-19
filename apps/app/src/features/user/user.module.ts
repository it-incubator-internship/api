import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../../common/database_module/prisma.module';
import { MailModule } from '../../providers/mailer/mail.module';

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

const userRepositories = [UserRepository];
const userService = [UserService];
const useCases = [
  RegistrationUserHandler,
  RegistrationEmailResendingHandler,
  RegistrationConfirmationHandler,
  PasswordRecoveryHandler,
  SetNewPasswordHandler,
  LoginUserHandler,
  RefreshTokenHandler,
  LogoutUserHandler,
];

@Module({
  imports: [MailModule, PrismaModule, CqrsModule, JwtModule.register({})],
  controllers: [UserController, AuthController],
  providers: [...userRepositories, ...userService, ...useCases, EmailAdapter],
})
export class UserModule {}
