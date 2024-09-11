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

  describe('get all sessions', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(200);
      await userHelper.addManyUsers({ count: 2 });
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

  describe('delete sessions', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(200);
      await userHelper.addManyUsers({ count: 2 });
    });

    it('получаем 3 сессии после двух логинов', async () => {
      await userHelper.loginUserByNumber(1);
      await userHelper.loginUserByNumber(1);
      await userHelper.loginUserByNumber(1);
      const tokens = userHelper.getTokensPairByNumber(1);

      const response = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(200);

      expect(response.body.length).toEqual(3);
    });

    it('удаляем сессию по ID, затем все сессии кроме текущей', async () => {
      const tokens = userHelper.getTokensPairByNumber(1);

      //получаем список сессии
      const sessionsResult = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(200);

      const session2 = sessionsResult.body[1];

      //удаляем одну из сессии
      await request(app.getHttpServer())
        .delete(`/sessions/${session2.sessionId}`)
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(204);

      //в списке должно быть две сессии
      const sessionsResultAfterDelete = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(200);

      expect(sessionsResultAfterDelete.body.length).toEqual(2);

      //удаляем все сессии кроме текущей
      await request(app.getHttpServer())
        .delete('/sessions/other')
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(204);

      //в списке должна быть одна сессия
      const oneSession = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(200);

      expect(oneSession.body.length).toEqual(1);
    });

    it('юзер пытается удалить чужую сессию', async () => {
      await userHelper.loginUserByNumber(2);
      const tokens = userHelper.getTokensPairByNumber(1);
      const tokensUser2 = userHelper.getTokensPairByNumber(2);

      //получаем список сессии первого пользователя
      const sessionsResult = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(200);

      const firstUserSessionId = sessionsResult.body[0].sessionId;

      //пробуем удалить чужую сессию
      await request(app.getHttpServer())
        .delete(`/sessions/${firstUserSessionId}`)
        .set('Cookie', `refreshToken=${tokensUser2!.refreshToken}`)
        .expect(403);

      //сессия должна остаться в списке
      const sessionsResultAfterDelete = await request(app.getHttpServer())
        .get('/sessions')
        .set('Cookie', `refreshToken=${tokens!.refreshToken}`)
        .expect(200);

      expect(sessionsResultAfterDelete.body[0].sessionId).toEqual(firstUserSessionId);
    });
  });
});
