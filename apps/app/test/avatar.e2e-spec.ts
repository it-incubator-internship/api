import * as process from 'node:process';

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import sharp from 'sharp';

import { AppModule } from '../src/app.module';
import { appSettings } from '../src/common/settings/apply-app-setting';
import { PrismaService } from '../src/common/database_module/prisma-connection.service';
import { MailService } from '../src/providers/mailer/mail.service';

import { MailServiceMock } from './mock/email-service.mock';

jest.setTimeout(15000); // увеличение времени ожидания

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let confirmationCode;
  let userId;
  let accessToken;
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
    console.log(process.env.DATABASE_APP_URL);

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

    userId = user!.id;
    confirmationCode = user!.accountData!.confirmationCode;
  }); // 201

  it('REGISTRATION CONFIRMATION with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: confirmationCode,
      })
      .expect(201);
  }); // 201

  it('LOGIN with correct data', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'e2e user-agent')
      .send({
        email: 'someemail@gmail.com',
        password: 'Somepassword=1',
      })
      .expect(201);

    accessToken = response.body.accessToken;
  }); // 201

  it('UPLOAD avatar without authorisation', async () => {
    const imageBuffer = await sharp('apps/app/test/images/avatar/avatar_true.jpeg').toBuffer();
    console.log('imageBuffer in avatar tests:', imageBuffer);

    await request(app.getHttpServer())
      .post('/file/avatar')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', imageBuffer)
      .expect(401);
  }); // 401

  it('UPLOAD avatar with incorrect data (wrong format)', async () => {
    await request(app.getHttpServer())
      .post('/file/avatar')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', 'apps/app/test/images/avatar/avatar_false_format.gif')
      .expect(400);
  }); // 400

  it('UPLOAD avatar with incorrect data (wrong size)', async () => {
    await request(app.getHttpServer())
      .post('/file/avatar')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', 'apps/app/test/images/avatar/avatar_false_size.jpeg')
      .expect(400);
  }); // 400

  it('UPLOAD avatar with correct data', async () => {
    await request(app.getHttpServer())
      .post('/file/avatar')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', 'apps/app/test/images/avatar/avatar_true.jpeg')
      .expect(201);
  }); // 201
});
