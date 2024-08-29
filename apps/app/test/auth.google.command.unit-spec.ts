import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';

import {
  GoogleAuthCommand,
  GoogleAuthHandler,
} from '../src/features/user/auth/application/command/oauth/google.auth.command';
import { UserRepository } from '../src/features/user/user/repository/user.repository';
import { UserAccountData, UserConfirmationStatusEnum } from '../src/features/user/user/domain/accoun-data.fabric';
import { UserBanStatusEnum, UserEntity } from '../src/features/user/user/domain/user.fabric';

describe('CreateBlogUseCase unit', () => {
  let googleAuthHandler: GoogleAuthHandler;
  let userRepository: UserRepository;
  let commandBus: CommandBus;

  beforeEach(async () => {
    // используется для инициализации тестового модуля и зависимостей перед каждым тестом
    const module: TestingModule = await Test.createTestingModule({
      // создание тестового модуля с помощью Test.createTestingModule()
      providers: [
        // массив провайдеров, которые должны быть включены в тестовый модуль (в данном случае это GoogleAuthHandler и специальный провайдер для UserRepository)
        GoogleAuthHandler,
        {
          provide: UserRepository, // создание mock объекта с помощью jest.fn()
          useValue: {
            findAccountDataByGoogleId: jest.fn(), // создание mock функции для метода findAccountDataByGoogleId() в UserRepository
            findUserByEmail: jest.fn(), // создание mock функции для метода findUserByEmail() в UserRepository
            findAccountDataById: jest.fn(), // создание mock функции для метода findAccountDataById() в UserRepository
            updateAccountData: jest.fn(), // создание mock функции для метода updateAccountData() в UserRepository
            findUserByUserName: jest.fn(), // создание mock функции для метода findUserByUserName() в UserRepository
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        CommandBus,
      ],
    }).compile(); // компиляция тестового модуля и подготовка его к использованию

    googleAuthHandler = module.get<GoogleAuthHandler>(GoogleAuthHandler); // получение экземпляра GoogleAuthHandler из тестового модуля
    userRepository = module.get<UserRepository>(UserRepository); // получение экземпляра UserRepository из тестового модуля
    commandBus = module.get<CommandBus>(CommandBus); // получение экземпляра CommandBus из тестового модуля
  });

  it('AUTH with account data by googleId', async () => {
    const accoutData = UserAccountData.convert({
      profileId: '111',
      confirmationStatus: UserConfirmationStatusEnum.CONFIRM,
      confirmationCode: 'someConfirmationCode',
      recoveryCode: null,
      githubId: null,
      googleId: '1',
    });

    const command = new GoogleAuthCommand({ googleId: '1', email: 'someemail@mail.ru', emailValidation: true }); // создание экземпляра класса GoogleAuthCommand
    jest.spyOn(userRepository, 'findAccountDataByGoogleId').mockResolvedValue(accoutData); // создание mock функции для метода findAccountDataByGoogleId()

    const result = await googleAuthHandler.execute(command); // вызов метода execute() в googleAuthHandler

    expect(result).toEqual('1');
  });

  it('AUTH without account data by googleId and without email in request', async () => {
    const command = new GoogleAuthCommand({ googleId: '1', email: null, emailValidation: true }); // создание экземпляра класса GoogleAuthCommand
    jest.spyOn(userRepository, 'findAccountDataByGoogleId').mockResolvedValue(null); // создание mock функции для метода findAccountDataByGoogleId()
    jest.spyOn(commandBus, 'execute').mockResolvedValue(null); // создание mock функции для метода execute()

    const result = await googleAuthHandler.execute(command); // вызов метода execute() в googleAuthHandler

    expect(result).toEqual('2');
  });

  it('AUTH without account data by googleId and with email in request and with user by email', async () => {
    const user = UserEntity.convert({
      id: '111',
      name: 'someName',
      email: 'someemail@mail.ru',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      passwordHash: 'somePasswordHash',
      banStatus: UserBanStatusEnum.NOT_BANNED,
      banDate: null,
    });

    const accoutData = UserAccountData.convert({
      profileId: '111',
      confirmationStatus: UserConfirmationStatusEnum.CONFIRM,
      confirmationCode: 'someConfirmationCode',
      recoveryCode: null,
      githubId: null,
      googleId: null,
    });

    const command = new GoogleAuthCommand({ googleId: '1', email: 'someemail@mail.ru', emailValidation: true }); // создание экземпляра класса GoogleAuthCommand
    jest.spyOn(userRepository, 'findAccountDataByGoogleId').mockResolvedValue(null); // создание mock функции для метода findAccountDataByGoogleId()
    jest.spyOn(userRepository, 'findUserByEmail').mockResolvedValue(user); // создание mock функции для метода findUserByEmail()
    jest.spyOn(userRepository, 'findAccountDataById').mockResolvedValue(accoutData); // создание mock функции для метода findAccountDataById()
    jest.spyOn(userRepository, 'updateAccountData').mockResolvedValue(accoutData); // создание mock функции для метода updateAccountData()
    jest.spyOn(commandBus, 'execute').mockResolvedValue(null); // создание mock функции для метода execute()

    const result = await googleAuthHandler.execute(command); // вызов метода execute() в googleAuthHandler

    expect(result).toEqual('3');
  });

  it('AUTH without account data by googleId and with email in request and without user by email and without user by userName', async () => {
    const command = new GoogleAuthCommand({ googleId: '1', email: 'someemail@mail.ru', emailValidation: true }); // создание экземпляра класса GoogleAuthCommand
    jest.spyOn(userRepository, 'findAccountDataByGoogleId').mockResolvedValue(null); // создание mock функции для метода findAccountDataByGoogleId()
    jest.spyOn(userRepository, 'findUserByEmail').mockResolvedValue(null); // создание mock функции для метода findUserByEmail()
    jest.spyOn(userRepository, 'findUserByUserName').mockResolvedValue(null); // создание mock функции для метода findUserByUserName()
    jest.spyOn(commandBus, 'execute').mockResolvedValue(null); // создание mock функции для метода execute()

    const result = await googleAuthHandler.execute(command); // вызов метода execute() в googleAuthHandler

    expect(result).toEqual('4');
  });

  it('AUTH without account data by googleId and with email in request and without user by email and with user by userName', async () => {
    const user = UserEntity.convert({
      id: '111',
      name: 'someemail',
      email: 'someemail@mail.ru',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      passwordHash: 'somePasswordHash',
      banStatus: UserBanStatusEnum.NOT_BANNED,
      banDate: null,
    });

    const command = new GoogleAuthCommand({ googleId: '1', email: 'someemail@mail.ru', emailValidation: true }); // создание экземпляра класса GoogleAuthCommand
    jest.spyOn(userRepository, 'findAccountDataByGoogleId').mockResolvedValue(null); // создание mock функции для метода findAccountDataByGoogleId()
    jest.spyOn(userRepository, 'findUserByEmail').mockResolvedValue(null); // создание mock функции для метода findUserByEmail()
    jest.spyOn(userRepository, 'findUserByUserName').mockResolvedValue(user); // создание mock функции для метода findUserByUserName()
    jest.spyOn(commandBus, 'execute').mockResolvedValue(null); // создание mock функции для метода execute()

    const result = await googleAuthHandler.execute(command); // вызов метода execute() в googleAuthHandler

    expect(result).toEqual('4');
  });
});
