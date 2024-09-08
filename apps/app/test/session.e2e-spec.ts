import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';

import { AppModule } from '../src/app.module';
import { appSettings } from '../src/common/settings/apply-app-setting';
import { PrismaService } from '../src/common/database_module/prisma-connection.service';
import { MailService } from '../src/providers/mailer/mail.service';

import { MailServiceMock } from './mock/email-service.mock';
import { UserE2EHelper } from './helpers/user.helper';

dotenv.config({ path: '.test.env' }); // Загружаем тестовую конфигурацию
describe('Sessions e2e', () => {
  let app: INestApplication;
  let userHelper: UserE2EHelper;
  let prisma: PrismaService;
  let httpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useClass(MailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();

    appSettings(app);

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    httpServer = app.getHttpServer();
    userHelper = new UserE2EHelper(prisma, httpServer);

    // очистка бд
    await request(app.getHttpServer()).delete('/testing/all-data').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('get all sessions', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(200);

      //Создаем 2 пользователей
      await userHelper.addManyUsers({ count: 2 });
    });

    afterAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(200);
    });

    it('не можем получить сессии без рефреш токена в куках', async () => {
      await request(app.getHttpServer()).get('/sessions').expect(401);
    });
    it('получаем 1 сессию после логина', async () => {
      await userHelper.loginUserByNumber(1);
      const tokens = userHelper.getTokensPairByNumber(1);

      const response = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(200);

      expect(response.body.length).toEqual(1);

      const user = userHelper.userByNumber(1);

      expect(response.body[0]).toEqual({
        sessionId: expect.any(String),
        userId: user.id,
        deviceName: expect.any(String),
        ip: expect.any(String),
        lastActiveDate: expect.any(String),
      });
    });

    it('получаем 2 сессии после второго логина', async () => {
      await userHelper.loginUserByNumber(1);
      const tokens = userHelper.getTokensPairByNumber(1);

      const response = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(200);

      expect(response.body.length).toEqual(2);

      const user = userHelper.userByNumber(1);

      const session = response.body[0];
      const session2 = response.body[1];

      expect(session).toEqual({
        sessionId: expect.any(String),
        userId: user.id,
        deviceName: expect.any(String),
        ip: expect.any(String),
        lastActiveDate: expect.any(String),
      });

      expect(session.sessionId).not.toEqual(session2.sessionId);

      expect(session2).toEqual({
        sessionId: expect.any(String),
        userId: user.id,
        deviceName: expect.any(String),
        ip: expect.any(String),
        lastActiveDate: expect.any(String),
      });
    });

    it('второй пользователь видит только свои сессии', async () => {
      const user2 = userHelper.userByNumber(2);
      const user1 = userHelper.userByNumber(1);
      await userHelper.loginUserByNumber(2);
      const tokens = userHelper.getTokensPairByNumber(2);

      const response = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(200);

      expect(response.body.length).toEqual(1);

      expect(response.body[0]).toEqual({
        sessionId: expect.any(String),
        userId: user2.id,
        deviceName: expect.any(String),
        ip: expect.any(String),
        lastActiveDate: expect.any(String),
      });

      expect(response.body[0].userId).not.toEqual(user1.id);
    });
  });
});
