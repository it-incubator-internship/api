import { Module } from '@nestjs/common';
import { UserController } from './user/controller/user.controller';
import { AuthController } from './auth/controller/auth.controller';
import { UserService } from './user/service/user.service';
import { UserRepository } from './user/repository/user.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { EmailAdapter } from './auth/email.adapter/email.adapter';
import { PrismaModule } from '../../common/database_module/prisma.module';
import { RegistrationUserUseCase } from './auth/command/registrarion.user.use.case';
import { RegistrationEmailResendingUseCase } from './auth/command/registration-email-resending.user.use.case';
import { RegistrationConfirmationUseCase } from './auth/command/registration-confirmation.user.use.case';
import { LoginUserHandler } from './auth/command/login.user.command';
import { LogoutUserUseCase } from './auth/command/logout.user.use.case';
import { PasswordRecoveryUseCase } from './auth/command/password-recovery.user.use.case';
import { SetNewPasswordUseCase } from './auth/command/set-new-password.user.use.case';

const userCommands = [];
const userRepositories = [UserRepository];
const userService = [UserService];
const useCases = [
  RegistrationUserUseCase,
  RegistrationEmailResendingUseCase,
  RegistrationConfirmationUseCase,
  LoginUserHandler,
  LogoutUserUseCase,
  PasswordRecoveryUseCase,
  SetNewPasswordUseCase,
];

@Module({
  imports: [PrismaModule, CqrsModule, JwtModule.register({})],
  controllers: [UserController, AuthController],
  providers: [...userRepositories, ...userService, ...useCases, EmailAdapter],
})
export class UserModule {}
