import { Test, TestingModule } from '@nestjs/testing';

import {
  GoogleAuthCommand,
  GoogleAuthHandler,
} from '../src/features/user/auth/application/command/google.auth.command';
import { UserRepository } from '../src/features/user/user/repository/user.repository';
import { UserAccountData, UserConfirmationStatusEnum } from '../src/features/user/user/domain/accoun-data.fabric';

describe('CreateBlogUseCase unit', () => {
  let googleAuthHandler: GoogleAuthHandler;
  let userRepository: UserRepository;

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
      ],
    }).compile(); // компиляция тестового модуля и подготовка его к использованию

    googleAuthHandler = module.get<GoogleAuthHandler>(GoogleAuthHandler); // получение экземпляра GoogleAuthHandler из тестового модуля
    userRepository = module.get<UserRepository>(UserRepository); // получение экземпляра UserRepository из тестового модуля
  });

  it('AUTH with account data by googleId', async () => {
    const accoutData = UserAccountData.convert({
      profileId: '111',
      confirmationStatus: UserConfirmationStatusEnum.CONFIRM,
      confirmationCode: '',
      recoveryCode: null,
      githubId: null,
      googleId: '1',
    });

    const command = new GoogleAuthCommand({ googleId: '1', email: 'someemail@mail.ru', emailValidation: true }); // создание экземпляра класса GoogleAuthCommand
    jest.spyOn(userRepository, 'findAccountDataByGoogleId').mockResolvedValue(accoutData); // создание mock функции для метода findAccountDataByGoogleId()

    const result = await googleAuthHandler.execute(command); // вызов метода execute() в googleAuthHandler

    expect(result).toEqual({
      isSuccess: true,
      errorStatus: 0,
      data: 777,
      errors: null,
    });
  });

  // it('CREATE blog without user id (success)', async () => {
  //   const command = new CreateBlogCommand(null, 'some name', 'some description', 'https://somewebsiteurl.com'); // создание экземпляра класса CreateBlogCommand
  //   // const blog = Blog.create(command.name, command.description, command.websiteUrl, null);   // создание экземпляра класса Blog
  //   jest.spyOn(blogDbRepository, 'saveBlog').mockResolvedValue(777); // создание mock функции для метода saveBlog() (когда этот метод будет вызван, он будет возвращать 777)

  //   const result = await useCase.execute(command); // вызов метода execute() в useCase

  //   expect(result).toEqual({
  //     isSuccess: true,
  //     errorStatus: 0,
  //     data: 777,
  //     errors: null,
  //   });
  // });

  // it('CREATE blog with user id (fail)', async () => {
  //   const command = new CreateBlogCommand('1', 'Test Blog', 'Test Description', 'https://example.com'); // создание экземпляра класса CreateBlogCommand
  //   // const blog = Blog.create(command.name, command.description, command.websiteUrl, Number(command.userId));   // создание экземпляра класса Blog
  //   jest.spyOn(blogDbRepository, 'saveBlog').mockResolvedValue(null); // создание mock функции для метода saveBlog() (когда этот метод будет вызван, он будет возвращать null)

  //   const result = await useCase.execute(command); // вызов метода execute() в useCase

  //   expect(result).toEqual({
  //     isSuccess: false,
  //     errorStatus: 418,
  //     data: null,
  //     errors: null,
  //   });
  // });
});

// expect(blogDbRepository.saveBlog).toHaveBeenCalledWith(blog);
// expect(blogDbRepository.saveBlog).toHaveBeenCalledWith(
//     expect.objectContaining({
//         name: "Test Blog",
//         description: "Test Description",
//         isBanned: false,
//         isMembership: false,
//         userId: 1
//     })
// )
