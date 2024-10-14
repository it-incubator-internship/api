import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';

import { AppModule } from '../src/app.module';
import { appSettings } from '../src/common/settings/apply-app-setting';
import { PrismaService } from '../src/common/database_module/prisma-connection.service';
import { MailService } from '../src/providers/mailer/mail.service';

import { MailServiceMock } from './mock/email-service.mock';

dotenv.config({ path: '.test.env' }); // Загружаем тестовую конфигурацию

describe('User e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user;
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
      include: {
        accountData: true,
      },
    });
  }); // 201

  it('REGISTRATION CONFIRMATION with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: user.accountData.confirmationCode,
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

  it('GET user profile by non-existing id', async () => {
    await request(app.getHttpServer()).get('/user/profile/5c2cd3ca-2820-4dbd-b29c-dc14d085af93').expect(404);
  }); // 404

  it('GET user profile by correct id (without profile information)', async () => {
    await request(app.getHttpServer())
      .get('/user/profile/' + user.id)
      .expect(200);
  }); // 200

  it('ADD profile information with incorrect data (empty fields)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '07.07.1997',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: '     ',
        firstName: '     ',
        lastName: '     ',
        dateOfBirth: '07.07.1997',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 777,
        firstName: 777,
        lastName: 777,
        dateOfBirth: 777,
        country: 777,
        city: 777,
        aboutMe: 777,
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (long length)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.1997',
        country: 'someCountry',
        city: 'someCity',
        aboutMe:
          'about me with veeeeeeeeeeeery long length\
          about me with veeeeeeeeeeeery long length\
          about me with veeeeeeeeeeeery long length\
          about me with veeeeeeeeeeeery long length\
          about me with veeeeeeeeeeeery long length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (userName) (pattern violation)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName+',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.1997',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (firstName) (pattern violation)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName+',
        lastName: 'someLastName',
        dateOfBirth: '07.07.1997',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (lastName) (pattern violation)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName+',
        dateOfBirth: '07.07.1997',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (dateOfBirth v1.0) (pattern violation)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: 'caramba',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (dateOfBirth v2.0) (pattern violation)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.197',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (dateOfBirth v3.0) (pattern violation)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '1997.07.07',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (country) (pattern violation)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.1997',
        country: 'someCountry+',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (city) (pattern violation)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.1197',
        country: 'someCountry',
        city: 'someCity+',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (aboutMe) (pattern violation)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: 'caramba',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: '你好',
      })
      .expect(400);
  }); // 400

  it('ADD profile information without authorization', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.1997',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(401);
  }); // 401

  it('ADD profile information to not your profile', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/5c2cd3ca-2820-4dbd-b29c-dc14d085af93')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.1997',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(403);
  }); // 403

  it('ADD profile information with incorrect data (less than 13 years)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.2017',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with incorrect data (more than 100 years)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.1907',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(400);
  }); // 400

  it('ADD profile information with correct data (without update userName and mandatory value)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
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

  it('UPDATE profile information with correct data (without update userName)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someusername',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.1997',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(200);
  }); // 200

  it('UPDATE profile information with correct data (without update profile)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someUserName',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        dateOfBirth: '07.07.1997',
        country: 'someCountry',
        city: 'someCity',
        aboutMe: 'some information about myself with normal length',
      })
      .expect(200);
  }); // 200

  it('UPDATE profile information with correct data (all profile)', async () => {
    await request(app.getHttpServer())
      .put('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userName: 'someNewUserName',
        firstName: 'someNewFirstName',
        lastName: 'someNewLastName',
        dateOfBirth: '08.08.1998',
        country: 'someNewCountry',
        city: 'someNewCity',
        aboutMe: 'some new information about myself with normal length',
      })
      .expect(200);
  }); // 200

  it('GET profile by id', async () => {
    await request(app.getHttpServer())
      .get('/user/profile/' + user.id)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  }); // 200
});
