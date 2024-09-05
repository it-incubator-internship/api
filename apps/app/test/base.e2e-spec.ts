import * as process from 'node:process';

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { appSettings } from '../src/common/settings/apply-app-setting';
import { PrismaService } from '../src/common/database_module/prisma-connection.service';
import { MailService } from '../src/providers/mailer/mail.service';

import { MailServiceMock } from './mock/email-service.mock';

jest.setTimeout(15000); // увеличение времени ожидания

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user;
  let accountData;
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

    user = await prisma.user.findFirst({
      where: {
        email: 'someemail@gmail.com',
      },
    });

    accountData = await prisma.accountData.findFirst({
      where: {
        profileId: user.id,
      },
    });
  }); // 201

  it('REGISTRATION CONFIRMATION with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: accountData.confirmationCode,
      })
      .expect(201);
  }); // 201

  it('FIND user by non-existing id', async () => {
    await request(app.getHttpServer())
      .get('/base/get/user/id')
      .send({
        id: 'd051a54d-61ed-4ba6-862f-63fb6c035adb',
      })
      .expect(404);
  }); // 200

  it('FIND user by id', async () => {
    const response = await request(app.getHttpServer())
      .get('/base/get/user/id')
      .send({
        id: user.id,
      })
      .expect(200);

    expect(response.body.id).toEqual(user.id);
  }); // 200

  it('FIND user by non-existing email', async () => {
    await request(app.getHttpServer())
      .get('/base/get/user/email')
      .send({
        email: 'caramba',
      })
      .expect(404);
  }); // 200

  it('FIND user by email', async () => {
    const response = await request(app.getHttpServer())
      .get('/base/get/user/email')
      .send({
        email: user.email,
      })
      .expect(200);

    expect(response.body.id).toEqual(user.id);
  }); // 200

  it('FIND user by non-existing name', async () => {
    await request(app.getHttpServer())
      .get('/base/get/user/name')
      .send({
        name: 'caramba',
      })
      .expect(404);
  }); // 404

  it('FIND user by name', async () => {
    const response = await request(app.getHttpServer())
      .get('/base/get/user/name')
      .send({
        name: user.name,
      })
      .expect(200);

    expect(response.body.id).toEqual(user.id);
  }); // 200

  it('FIND accountData by non-existing id', async () => {
    await request(app.getHttpServer())
      .get('/base/get/accountdata/profileid')
      .send({
        profileId: 'd051a54d-61ed-4ba6-862f-63fb6c035adb',
      })
      .expect(404);
  }); // 404

  it('FIND accountData by id', async () => {
    const response = await request(app.getHttpServer())
      .get('/base/get/accountdata/profileid')
      .send({
        profileId: user.id,
      })
      .expect(200);

    expect(response.body.profileId).toEqual(user.id);
  }); // 200

  it('UPDATE user name', async () => {
    const response = await request(app.getHttpServer())
      .put('/base/put/user/name')
      .send({
        id: user.id,
        name: 'T800',
      })
      .expect(200);

    expect(response.body.id).toEqual(user.id);
    expect(response.body.name).toEqual('T800');
  }); // 200

  it('UPDATE user email', async () => {
    const response = await request(app.getHttpServer())
      .put('/base/put/user/email')
      .send({
        id: user.id,
        email: 'T800@mail.ru',
      })
      .expect(200);

    expect(response.body.id).toEqual(user.id);
    expect(response.body.email).toEqual('T800@mail.ru');
  }); // 200

  it('UPDATE user name and email', async () => {
    const response = await request(app.getHttpServer())
      .put('/base/put/user/all')
      .send({
        id: user.id,
        name: 'T1000',
        email: 'T1000@mail.ru',
      })
      .expect(200);

    expect(response.body.id).toEqual(user.id);
    expect(response.body.name).toEqual('T1000');
    expect(response.body.email).toEqual('T1000@mail.ru');
  }); // 200

  it('UPDATE accountData confirmationCode', async () => {
    const response = await request(app.getHttpServer())
      .put('/base/put/accountdata/confirmationcode')
      .send({
        id: user.id,
        confirmationCode: 'cc1',
      })
      .expect(200);

    expect(response.body.profileId).toEqual(user.id);
    expect(response.body.confirmationCode).toEqual('cc1');
  }); // 200

  it('UPDATE accountData recoveryCode', async () => {
    const response = await request(app.getHttpServer())
      .put('/base/put/accountdata/recoverycode')
      .send({
        id: user.id,
        recoveryCode: 'rc1',
      })
      .expect(200);

    expect(response.body.profileId).toEqual(user.id);
    expect(response.body.recoveryCode).toEqual('rc1');
  }); // 200

  it('UPDATE accountData googleId', async () => {
    const response = await request(app.getHttpServer())
      .put('/base/put/accountdata/googleid')
      .send({
        id: user.id,
        googleId: 'gg1',
      })
      .expect(200);

    expect(response.body.profileId).toEqual(user.id);
    expect(response.body.googleId).toEqual('gg1');
  }); // 200

  it('UPDATE accountData githubId', async () => {
    const response = await request(app.getHttpServer())
      .put('/base/put/accountdata/githubid')
      .send({
        id: user.id,
        githubId: 'gh1',
      })
      .expect(200);

    expect(response.body.profileId).toEqual(user.id);
    expect(response.body.githubId).toEqual('gh1');
  }); // 200

  it('UPDATE accountData all', async () => {
    const response = await request(app.getHttpServer())
      .put('/base/put/accountdata/all')
      .send({
        id: user.id,
        confirmationCode: 'cc2',
        recoveryCode: 'rc2',
        googleId: 'gg2',
        githubId: 'gh2',
      })
      .expect(200);

    expect(response.body.profileId).toEqual(user.id);
    expect(response.body.confirmationCode).toEqual('cc2');
    expect(response.body.recoveryCode).toEqual('rc2');
    expect(response.body.googleId).toEqual('gg2');
    expect(response.body.githubId).toEqual('gh2');
  }); // 200

  it('UPDATE accountData confirmationCode', async () => {
    const response = await request(app.getHttpServer())
      .put('/base/put/accountdata/confirmationcode')
      .send({
        id: user.id,
        confirmationCode: 'cc3',
      })
      .expect(200);

    expect(response.body.profileId).toEqual(user.id);
    expect(response.body.confirmationCode).toEqual('cc3');
  }); // 200
});
