import * as process from 'node:process';

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { appSettings } from '../src/common/settings/apply-app-setting';
import { PrismaService } from '../src/common/database_module/prisma-connection.service';
import { MailService } from '../src/providers/mailer/mail.service';

import { MailServiceMock } from './mock/email-service.mock';

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let confirmationCode;
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

    // очистка бд
    await request(app.getHttpServer()).delete('/testing/all-data').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  it('REGISTRATION with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someusername',
        password: 'Somepassword=1',
        passwordConfirmation: 'Somepassword=1',
        email: 'someemail@gmail.com',
        isAgreement: true,
      })
      .expect(201);

    const user = await prisma.user.findFirst({
      where: {
        email: 'someemail@gmail.com',
      },
      include: {
        accountData: true,
      },
    });

    confirmationCode = user!.accountData!.confirmationCode;
  }); // 201

  it('CODE VALIDATION with incorrect data (expired token)', async () => {
    await request(app.getHttpServer())
      .post('/auth/code-validation')
      .send({
        code: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVlbWFpbEBnbWFpbC5jb20iLCJpYXQiOjE3MjYxNjgyODUsImV4cCI6MTcyNjE2ODI5MH0.KPnSg2iRwftg-t9eNbXBwDBD3xHUNg7zZSaY6dKhP30',
      })
      .expect(403);
  }); // 403

  it('CODE VALIDATION with incorrect data (incorrect token)', async () => {
    await request(app.getHttpServer())
      .post('/auth/code-validation')
      .send({
        code: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVlbWFpbEBnbWFpbC5jb20iLCJpYXQiOjE3MjYxNjgyODUsImV4cCI6MTcyNjE2ODI5777.KPnSg2iRwftg-t9eNbXBwDBD3xHUNg7zZSaY6dKhP30',
      })
      .expect(401);
  }); // 401

  it('CODE VALIDATION with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/code-validation')
      .send({
        code: confirmationCode,
      })
      .expect(201);
  }); // 201
});
