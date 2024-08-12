import { Module } from '@nestjs/common';
import { UserController } from './user/controller/user.controller';
import { AuthController } from './auth/controller/auth.controller';
import { UserService } from './user/service/user.service';
import { PrismaService } from '../../common/db/service/prisma-connection.service';
import { UserRepository } from './user/repository/user.repository';
import { RegistrationUserUseCase } from './auth/use.cases/registrarion.user.use.case';
import { RegistrationEmailResendingUseCase } from './auth/use.cases/registration-email-resending.user.use.case';
import { RegistrationConfirmationUseCase } from './auth/use.cases/registration-confirmation.user.use.case';
import { LoginUserUseCase } from './auth/use.cases/login.user.use.case';
import { LogoutUserUseCase } from './auth/use.cases/logout.user.use.case';
import { PasswordRecoveryUseCase } from './auth/use.cases/password-recovery.user.use.case';
import { SetNewPasswordUseCase } from './auth/use.cases/set-new-password.user.use.case';
import { CqrsModule } from '@nestjs/cqrs';

const userCommands = [];
const userRepositories = [UserRepository];
const userService = [UserService];
const useCases = [
  RegistrationUserUseCase,
  RegistrationEmailResendingUseCase,
  RegistrationConfirmationUseCase,
  LoginUserUseCase,
  LogoutUserUseCase,
  PasswordRecoveryUseCase,
  SetNewPasswordUseCase,
];

@Module({
  imports: [CqrsModule],
  controllers: [UserController, AuthController],
  providers: [...userRepositories, ...userService, ...useCases, PrismaService],
})
export class UserModule {}
