import * as process from 'node:process';

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import sharp from 'sharp';

import { AppModule } from '../src/app.module';
import { appSettings } from '../src/common/settings/apply-app-setting';
import { PrismaService } from '../src/common/database_module/prisma-connection.service';
import { MailService } from '../src/providers/mailer/mail.service';
import { FileController } from '../src/features/file/controller/file.controller';

import { MailServiceMock } from './mock/email-service.mock';

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let controller;
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

    controller = moduleFixture.get<FileController>(FileController);

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

    await request(app.getHttpServer())
      .post('/file/avatar')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', imageBuffer)
      .expect(401);
  }); // 401

  it('UPLOAD avatar without image', async () => {
    await request(app.getHttpServer()).post('/file/avatar').set('Authorization', `Bearer ${accessToken}`).expect(400);
  }); // 400

  it.skip('UPLOAD avatar with correct data (profile not found)', async () => {
    const imageBuffer = await sharp('apps/app/test/images/avatar/avatar_true.jpeg').toBuffer();

    jest.spyOn(controller, 'streamAvatarToFileMicroservice').mockImplementation(async () => {
      return { statusCode: 201, body: { url: 'https://example.com/avatar.webp' } };
    });

    await request(app.getHttpServer())
      .post('/file/avatar')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', imageBuffer)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  }); // 404

  it('DELETE avatar with correct data (profile not found)', async () => {
    await request(app.getHttpServer()).delete('/file/avatar').set('Authorization', `Bearer ${accessToken}`).expect(404);
  }); // 404

  it('ADD profile information with correct data (without update userName and mandatory value)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + userId)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someusername',
        firstName: 'somefirstname',
        lastName: 'somelastname',
        dateOfBirth: '',
        country: '',
        city: '',
        aboutMe: '',
      })
      .expect(200);
  }); // 200

  it('UPLOAD avatar with correct data', async () => {
    const imageBuffer = await sharp('apps/app/test/images/avatar/avatar_true.jpeg').toBuffer();

    jest.spyOn(controller, 'streamAvatarToFileMicroservice').mockImplementation(async () => {
      return { statusCode: 201, body: { url: 'https://example.com/avatar.webp' } };
    });

    await request(app.getHttpServer())
      .post('/file/avatar')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', imageBuffer)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  }); // 201

  it.skip('UPLOAD avatar with incorrect data (wrong format)', async () => {
    const imageBuffer = await sharp('apps/app/test/images/avatar/avatar_false_format.jpeg').toBuffer();

    await request(app.getHttpServer())
      .post('/file/avatar')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', imageBuffer)
      .expect(400);
  }); // 400

  it.skip('UPLOAD avatar with incorrect data (wrong size)', async () => {
    const imageBuffer = await sharp('apps/app/test/images/avatar/avatar_false_size.jpeg').toBuffer();

    await request(app.getHttpServer())
      .post('/file/avatar')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', imageBuffer)
      .expect(400);
  }); // 400

  it.skip('UPLOAD avatar with correct data', async () => {
    const imageBuffer = await sharp('apps/app/test/images/avatar/avatar_true.jpeg').toBuffer();

    await request(app.getHttpServer())
      .post('/file/avatar')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', imageBuffer)
      .expect(201);
  }); // 201

  it('DELETE avatar without authorisation', async () => {
    await request(app.getHttpServer()).delete('/file/avatar').expect(401);
  }); // 401
});
