// import * as process from 'node:process';

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AppModule } from '../src/app.module';
import { appSettings } from '../src/common/settings/apply-app-setting';
import { PrismaService } from '../src/common/database_module/prisma-connection.service';
import { MailService } from '../src/providers/mailer/mail.service';

import { MailServiceMock } from './mock/email-service.mock';

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let confirmationCode_1;
  let confirmationCode_2;
  let recoveryCode_1;
  let recoveryCode_2;
  let accessToken;
  let refreshToken;
  let httpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }) //Мокаем ддос защиту для того что бы она не мешала
      .overrideGuard(ThrottlerGuard)
      .useValue({
        canActivate: () => {
          return true;
        },
      })
      .overrideProvider(MailService)
      .useClass(MailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();

    appSettings(app);

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    // console.log(process.env.DATABASE_APP_URL);

    httpServer = app.getHttpServer();

    // очистка бд
    await request(app.getHttpServer()).delete('/testing/all-data').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  it('REGISTRATION with incorrect data (empty fields)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: '',
        password: '',
        passwordConfirmation: '',
        email: '',
        isAgreement: true,
      })
      .expect(400);
  }); // 400

  it('REGISTRATION with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: '     ',
        password: '     ',
        passwordConfirmation: '     ',
        email: '     ',
        isAgreement: true,
      })
      .expect(400);
  }); // 400

  it('REGISTRATION with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 777,
        password: 777,
        passwordConfirmation: 777,
        email: 777,
        isAgreement: true,
      })
      .expect(400);
  }); // 400

  it('REGISTRATION with incorrect data (small length)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'short',
        password: 'Sh0=1',
        passwordConfirmation: 'Sh0=1',
        email: 'someemail@mail.com',
        isAgreement: true,
      })
      .expect(400);
  }); // 400

  it('REGISTRATION with incorrect data (whitespaces + small length + whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: '   short   ',
        password: '   Sh0=1   ',
        passwordConfirmation: '   Sh0=1   ',
        email: 'someemail@mail.com',
        isAgreement: true,
      })
      .expect(400);
  }); // 400

  it.skip('REGISTRATION with correct data (throttler error)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someusername',
        password: 'Somepassword=1',
        passwordConfirmation: 'Somepassword=1',
        email: 'someemail@gmail.com',
        isAgreement: true,
      })
      .expect(429);
  }); // 429   т.к. замокан throttler

  it('REGISTRATION with incorrect data (long length)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someusernamewithalonglength',
        password: 'Somepasswordwithalooonglength=1',
        passwordConfirmation: 'Somepasswordwithalooonglength=1',
        email: 'someemail@mail.com',
        isAgreement: true,
      })
      .expect(400);
  }); // 400 *

  it('REGISTRATION with incorrect data (pattern violation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'some user name',
        password: 'some password',
        passwordConfirmation: 'some password',
        email: 'someemail@mail.com',
        isAgreement: true,
      })
      .expect(400);
  }); // 400 *

  it('REGISTRATION with incorrect data (mismatched passwords)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someusername',
        password: 'Somepassword=1',
        passwordConfirmation: 'Somepassword=2',
        email: 'someemail@gmail.com',
        isAgreement: false,
      })
      .expect(400);
  }); // 400 *

  it('REGISTRATION with incorrect data (isAgreement: false)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someusername',
        password: 'Somepassword=1',
        passwordConfirmation: 'Somepassword=1',
        email: 'someemail@gmail.com',
        isAgreement: false,
      })
      .expect(400);
  }); // 400 *

  it('REGISTRATION with correct data (whitespaces + correct data + whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: '           someusername           ',
        password: '     Somepassword=1     ',
        passwordConfirmation: '     Somepassword=1     ',
        email: ' someemail@gmail.com ',
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

    confirmationCode_1 = user!.accountData!.confirmationCode;
  }); // 201 *

  it.skip('REGISTRATION with correct data (swagger data)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        email: 'felixArgyle@neko.by',
        userName: 'FelixArgyle',
        password: 'StRo0NgP@SSWoRD',
        passwordConfirmation: 'StRo0NgP@SSWoRD',
        isAgreement: true,
      })
      .expect(201);
  }); // 201

  it('REGISTRATION with incorrect data (re-registration with repeated userName)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someusername',
        password: 'Somepassword=1',
        passwordConfirmation: 'Somepassword=1',
        email: 'someanotheremail@gmail.com',
        isAgreement: true,
      })
      .expect(400);
  }); // 400 *

  it('REGISTRATION with incorrect data (re-registration with repeated email)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someanotherusername',
        password: 'Somepassword=1',
        passwordConfirmation: 'Somepassword=1',
        email: 'someemail@gmail.com',
        isAgreement: true,
      })
      .expect(400);
  }); // 400 *

  it('LOGIN with incorrect data (login without registration confirmation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'e2e user-agent')
      .send({
        email: 'someemail@gmail.com',
        password: 'Somepassword=1',
      })
      .expect(403);
  }); // 403 *

  it.skip('REGISTRATION EMAIL RESENDING with incorrect data (empty fiels)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: '',
      })
      .expect(400);
  }); // 400

  it('REGISTRATION EMAIL RESENDING with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: '     ',
      })
      .expect(400);
  }); // 400 *

  it('REGISTRATION EMAIL RESENDING with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 777,
      })
      .expect(400);
  }); // 400 *

  it('REGISTRATION EMAIL RESENDING with incorrect data (pattern violation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'caramba',
      })
      .expect(400);
  }); // 400 *

  it('REGISTRATION EMAIL RESENDING with incorrect data (non-existing value)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'caramba@gmail.com',
      })
      .expect(400);
  }); // 400 *

  it.skip('REGISTRATION EMAIL RESENDING with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'someemail@gmail.com',
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

    confirmationCode_2 = user!.accountData!.confirmationCode;
  }); // 201

  it('REGISTRATION CONFIRMATION with incorrect data (empty fiels)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: '',
      })
      .expect(400);
  }); // 400 *

  it('REGISTRATION CONFIRMATION with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: '     ',
      })
      .expect(400);
  }); // 400 *

  it('REGISTRATION CONFIRMATION with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: 777,
      })
      .expect(400);
  }); // 400 *

  it.skip('REGISTRATION CONFIRMATION with incorrect data (non-existing value)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: confirmationCode_1,
      })
      .expect(400);
  }); // 400

  it.skip('REGISTRATION CONFIRMATION with incorrect data (swagger data)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVlbWFpbEBnbWFpbC5jb20iLCJpYXQiOjE3MjQ2ODQzMzMsImV4cCI6MTcyNDc3MDczM30.n0QviZkcsNMA9zs-S7gGhcsDyCKMXX4EVrrkRtWPeF0',
      })
      .expect(400);
  }); // 400

  //TODO skip
  it.skip('REGISTRATION CONFIRMATION with correct data (for jenkins)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: confirmationCode_1,
      })
      .expect(201);
  }); // 201

  it.skip('REGISTRATION CONFIRMATION with correct data (for normal tests)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: confirmationCode_2,
      })
      .expect(201);
  }); // 201

  it('REGISTRATION CONFIRMATION with incorrect data (re-registration confirmation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: confirmationCode_2,
      })
      .expect(400);
  }); // 400 *

  //TODO skip
  it.skip('REGISTRATION EMAIL RESENDING with incorrect data (email has already been confirmed)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'someemail@gmail.com',
      })
      .expect(400);
  }); // 400

  it('LOGIN with incorrect data (empty fiels)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: '',
        password: '',
      })
      .expect(401);
  }); // 401 *

  it('LOGIN with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: '     ',
        password: '     ',
      })
      .expect(401);
  }); // 401 *

  it('LOGIN with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 777,
        password: 777,
      })
      .expect(401);
  }); // 401 *

  it('LOGIN with incorrect data (pattern violation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'caramba',
        password: 'some password',
      })
      .expect(401);
  }); // 401 *

  it('LOGIN with incorrect data (non-existing email)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'caramba@mail.com',
        password: 'Somepassword=1',
      })
      .expect(401);
  }); // 401 *

  it('LOGIN with incorrect data (non-existing password)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'someemail@mail.com',
        password: 'Somepassword=0',
      })
      .expect(401);
  }); // 401 *

  //TODO skip
  it.skip('LOGIN with correct data', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'e2e user-agent')
      .send({
        email: 'someemail@gmail.com',
        password: 'Somepassword=1',
      })
      .expect(201);

    refreshToken = response.headers['set-cookie'];
  }); // 201

  it('UPDATE tokens without refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/refresh-token').expect(401);
  }); // 401 *

  it('UPDATE tokens with incorrect refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/refresh-token').set('Cookie', 'refreshToken=caramba').expect(401);
  }); // 401 *

  //TODO skip
  it.skip('UPDATE tokens with correct refresh token', async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const response = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', refreshToken)
      .expect(201);

    refreshToken = response.headers['set-cookie'];
  }); // 201

  it('LOGOUT without refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/logout').expect(401);
  }); // 401 *

  it('LOGOUT with incorrect refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/logout').set('Cookie', 'refreshToken=caramba').expect(401);
  }); // 401 *

  //TODO skip
  it.skip('LOGOUT with correct refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/logout').set('Cookie', refreshToken).expect(201);
  }); // 201

  //TODO skip
  it.skip('LOGIN with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'e2e user-agent')
      .send({
        email: 'someemail@gmail.com',
        password: 'Somepassword=1',
      })
      .expect(201);
  }); // 201

  it.skip('PASSWORD RECOVERY with incorrect data (empty fiels)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: '',
        recaptchaToken: '',
      })
      .expect(400);
  }); // 400   // т.к. появился recaptchaAuthGuard падает 403

  it.skip('PASSWORD RECOVERY with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: '     ',
        recaptchaToken: '     ',
      })
      .expect(400);
  }); // 400   // т.к. появился recaptchaAuthGuard падает 403

  it.skip('PASSWORD RECOVERY with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 777,
        recaptchaToken: 777,
      })
      .expect(400);
  }); // 400   // т.к. появился recaptchaAuthGuard падает 403

  it.skip('PASSWORD RECOVERY with incorrect data (pattern violation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'caramba',
        recaptchaToken: 'caramba',
      })
      .expect(400);
  }); // 400   // т.к. появился recaptchaAuthGuard падает 403

  it.skip('PASSWORD RECOVERY with incorrect data (non-existing value)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'caramba@gmail.com',
        recaptchaToken: 'caramba',
      })
      .expect(400);
  }); // 400   // т.к. появился recaptchaAuthGuard падает 403

  it('PASSWORD RECOVERY with incorrect data (wrong recaptchaToken)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'someemail@gmail.com',
        recaptchaToken: '777',
      })
      .expect(403);
  }); // 403 *

  it.skip('PASSWORD RECOVERY with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'someemail@gmail.com',
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

    recoveryCode_1 = user!.accountData!.recoveryCode;
  }); // 201

  it.skip('SET NEW PASSWORD with incorrect data (empty fiels)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: '',
        newPassword: '',
        passwordConfirmation: '',
      })
      .expect(400);
  }); // 400

  it.skip('SET NEW PASSWORD with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: '     ',
        newPassword: '     ',
        passwordConfirmation: '     ',
      })
      .expect(400);
  }); // 400

  it.skip('SET NEW PASSWORD with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: 777,
        newPassword: 777,
        passwordConfirmation: 777,
      })
      .expect(400);
  }); // 400

  it.skip('SET NEW PASSWORD with incorrect data (pattern violation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: recoveryCode_1,
        newPassword: 'some password',
        passwordConfirmation: 'some password',
      })
      .expect(400);
  }); // 400

  it.skip('SET NEW PASSWORD with incorrect data (non-existing value)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: 'caramba',
        newPassword: 'some password',
        passwordConfirmation: 'some password',
      })
      .expect(400);
  }); // 400

  it.skip('SET NEW PASSWORD with incorrect data (mismatched passwords)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: recoveryCode_1,
        newPassword: 'Somepassword=2',
        passwordConfirmation: 'Somepassword=3',
      })
      .expect(400);
  }); // 400

  it.skip('SET NEW PASSWORD with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: recoveryCode_1,
        newPassword: 'Somepassword=2',
        passwordConfirmation: 'Somepassword=2',
      })
      .expect(201);
  }); // 201

  it.skip('PASSWORD RECOVERY with correct data (for swagger)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'someemail@gmail.com',
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

    recoveryCode_2 = user!.accountData!.recoveryCode;
  }); // 201

  it.skip('SET NEW PASSWORD with incorrect data (swagger data)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVlbWFpbEBnbWFpbC5jb20iLCJpYXQiOjE3MjQ2ODQzMzMsImV4cCI6MTcyNDc3MDczM30.n0QviZkcsNMA9zs-S7gGhcsDyCKMXX4EVrrkRtWPeF0',
        newPassword: 'StRo0NgP@SSWoRD',
        passwordConfirmation: 'StRo0NgP@SSWoRD',
      })
      .expect(400);
  }); // 400

  it.skip('SET NEW PASSWORD with correct data (swagger password)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: recoveryCode_2,
        newPassword: 'StRo0NgP@SSWoRD',
        passwordConfirmation: 'StRo0NgP@SSWoRD',
      })
      .expect(201);
  }); // 201

  //TODO skip
  it.skip('LOGIN with correct data', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'e2e user-agent')
      .send({
        email: 'someemail@gmail.com',
        password: 'Somepassword=1', // 'Somepassword=2' не актуалет, т.к. не было смены пароля
      })
      .expect(201);

    accessToken = response.body.accessToken;
  }); // 201

  it('GET information about current user without authorisation', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  }); // 401 *

  it('GET information about current user with wrong accesstoken', async () => {
    await request(app.getHttpServer()).get('/auth/me').set('Authorization', 'Bearer caramba').expect(401);
  }); // 401 *

  it('GET information about current user with incorrect accesstoken', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NjMxIiwiaWF0IjoxNzIyOTQ5OTg2LCJleHAiOjE3MjI5NTA0ODZ9.W54wVkjnhY5Oo4VzY_sBQUzIgrK1vTwAnsgGSvRL_e4',
      )
      .expect(401);
  }); // 401 *

  //TODO skip
  it.skip('GET information about current user with correct accesstoken', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual({
      email: 'someemail@gmail.com',
      userName: 'someusername',
      userId: expect.any(String),
    });
  }); // 200
});
