import { randomUUID } from 'crypto';

import * as dotenv from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';

import {
  GithubOauthCommand,
  GithubOauthHandler,
} from '../../src/features/user/auth/application/command/oauth/github-oauth.command';
import { PrismaModule } from '../../src/common/database_module/prisma.module';
import { UserRepository } from '../../src/features/user/user/repository/user.repository';
import { SessionRepository } from '../../src/features/user/auth/repository/session.repository';
import { PrismaService } from '../../src/common/database_module/prisma-connection.service';

dotenv.config({ path: '.test.env' }); // Загружаем тестовую конфигурацию

const mockUser = {
  id: 'github-id',
  displayName: 'vlad',
  email: 'vlad@mail.ru',
};

//TODO пофиксить тесты
describe('GithubOauthHandler (Integration)', () => {
  let handler: GithubOauthHandler;
  let prismaService: PrismaService;
  let userRepository: UserRepository;
  let sessionRepository: SessionRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [GithubOauthHandler, UserRepository, SessionRepository],
    }).compile();

    handler = module.get<GithubOauthHandler>(GithubOauthHandler);
    userRepository = module.get<UserRepository>(UserRepository);
    sessionRepository = module.get<SessionRepository>(SessionRepository);
    prismaService = module.get<PrismaService>(PrismaService); // Получаем PrismaService для прямого доступа к базе данных
  });

  beforeEach(async () => {
    await sessionRepository.deleteAllSessions();
    await userRepository.deleteAllUsers();
  });

  afterEach(async () => {
    await sessionRepository.deleteAllSessions();
    await userRepository.deleteAllUsers();
  });

  afterAll(async () => {
    await prismaService.$disconnect(); // Закрываем соединение с базой данных
  });

  it('создаем нового пользователя с нормальным ником если он не занят и почта свободна', async () => {
    const command = new GithubOauthCommand({
      id: mockUser.id,
      displayName: mockUser.displayName,
      email: mockUser.email,
    });

    await handler.execute(command);

    const user = await prismaService.user.findFirst({ where: { email: mockUser.email } });
    expect(user).toBeDefined();
    expect(user!.email).toBe(mockUser.email);
    expect(user!.name).toBe(mockUser.displayName);
  });

  it('создаем нового пользователя с измененным  ником если он уже занят и почта свободна', async () => {
    await prismaService.user.create({
      data: {
        id: randomUUID(),
        name: mockUser.displayName,
        email: 'test@example.com',
        passwordHash: 'some-hash',
      },
    });

    const command = new GithubOauthCommand({
      id: mockUser.id,
      displayName: mockUser.displayName,
      email: mockUser.email,
    });

    await handler.execute(command);

    const user = await prismaService.user.findFirst({ where: { email: mockUser.email } });
    expect(user).toBeDefined();
    expect(user!.email).toBe(mockUser.email);
    expect(user!.name).not.toBe(mockUser.displayName);
  });

  it('создаем нового пользователя когда почта не пришла от гита', async () => {
    const command = new GithubOauthCommand({
      id: mockUser.id,
      displayName: mockUser.displayName,
      email: null,
    });

    await handler.execute(command);

    const user = await prismaService.user.findFirst({ where: { name: mockUser.displayName } });

    expect(user).toBeDefined();
    expect(user!.email).toBe('');
    expect(user!.name).toBe(mockUser.displayName);
  });

  it('создаем нового пользователя когда почта не пришла от гита а ник уже занят', async () => {
    await prismaService.user.create({
      data: {
        id: randomUUID(),
        name: mockUser.displayName,
        email: 'test@example.com',
        passwordHash: 'some-`hash`',
      },
    });

    const command = new GithubOauthCommand({
      id: mockUser.id,
      displayName: mockUser.displayName,
      email: null,
    });

    await handler.execute(command);

    const accountData = await prismaService.accountData.findFirst({ where: { githubId: mockUser.id } });
    const user = await prismaService.user.findUnique({ where: { id: accountData?.profileId } });

    expect(user).toBeDefined();
    expect(user!.email).toBe('');
    expect(user!.name).not.toBe(mockUser.displayName);
  });

  it('мерджим гитхаб ак к уже существующему пользователю', async () => {
    await prismaService.user.create({
      data: {
        name: 'test',
        email: mockUser.displayName,
        passwordHash: 'some-hash',
      },
    });

    const command = new GithubOauthCommand({
      id: mockUser.id,
      displayName: mockUser.displayName,
      email: mockUser.email,
    });

    await handler.execute(command);

    const user = await prismaService.user.findFirst({ where: { email: mockUser.email } });

    expect(user).toBeDefined();
    expect(user!.email).toBe(mockUser.email);

    const accountData = await prismaService.accountData.findFirst({ where: { githubId: mockUser.id } });
    expect(accountData?.githubId).toBe(mockUser.id);
    expect(accountData?.profileId).toBe(user!.id);
  });
});
