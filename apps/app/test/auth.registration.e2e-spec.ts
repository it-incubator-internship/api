import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { EmailAdapter } from '../src/features/user/auth/email.adapter/email.adapter';
import { EmailAdapterMock } from '../src/features/user/auth/email.adapter/email.adapte.mock';
import { appSettings } from '../src/common/settings/apply-app-setting';
import { PrismaService } from '../src/common/database_module/prisma-connection.service';

jest.setTimeout(15000); // увеличение времени ожидания

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let confirmationCode;
  let recoveryCode;
  let refreshToken;
  let httpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailAdapter)
      .useClass(EmailAdapterMock)
      .compile();

    app = moduleFixture.createNestApplication();

    appSettings(app);

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    httpServer = app.getHttpServer();

    // await request(app.getHttpServer())
    //     .delete('/testing/all-data')
    //     .expect(204)
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
  }); // 400

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
  }); // 400

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
  }); // 400

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
  }); // 400

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
  }); // 400

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
  }); // 400

  it('REGISTRATION EMAIL RESENDING with incorrect data (empty fiels)', async () => {
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
  }); // 400

  it('REGISTRATION EMAIL RESENDING with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 777,
      })
      .expect(400);
  }); // 400

  it('REGISTRATION EMAIL RESENDING with incorrect data (pattern violation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'caramba',
      })
      .expect(400);
  }); // 400

  it('REGISTRATION EMAIL RESENDING with incorrect data (non-existing value)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'caramba@gmail.com',
      })
      .expect(400);
  }); // 400

  it('REGISTRATION EMAIL RESENDING with correct data', async () => {
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

    confirmationCode = user!.accountData!.confirmationCode;
  }); // 201

  it('REGISTRATION CONFIRMATION with incorrect data (empty fiels)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: '',
      })
      .expect(400);
  }); // 400

  it('REGISTRATION CONFIRMATION with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: '     ',
      })
      .expect(400);
  }); // 400

  it('REGISTRATION CONFIRMATION with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: 777,
      })
      .expect(400);
  }); // 400

  it('REGISTRATION CONFIRMATION with incorrect data (non-existing value)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: 'caramba',
      })
      .expect(400);
  }); // 400

  it('REGISTRATION CONFIRMATION with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: confirmationCode,
      })
      .expect(201);
  }); // 201

  it('REGISTRATION CONFIRMATION with incorrect data (re-registration confirmation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: confirmationCode,
      })
      .expect(400);
  }); // 400

  it('REGISTRATION EMAIL RESENDING with incorrect data (email has already been confirmed)', async () => {
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
  }); // 401

  it('LOGIN with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: '     ',
        password: '     ',
      })
      .expect(401);
  }); // 401

  it('LOGIN with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 777,
        password: 777,
      })
      .expect(401);
  }); // 401

  it('LOGIN with incorrect data (pattern violation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'caramba',
        password: 'some password',
      })
      .expect(401);
  }); // 401

  it('LOGIN with incorrect data (non-existing email)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'caramba@mail.com',
        password: 'Somepassword=1',
      })
      .expect(401);
  }); // 401

  it('LOGIN with incorrect data (non-existing password)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'someemail@mail.com',
        password: 'Somepassword=0',
      })
      .expect(401);
  }); // 401

  it('LOGIN with correct data', async () => {
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
  }); // 401

  it('UPDATE tokens with incorrect refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/refresh-token').set('Cookie', 'refreshToken=caramba').expect(401);
  }); // 401

  it('UPDATE tokens with correct refresh token', async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const response = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', refreshToken)
      .expect(201);

    refreshToken = response.headers['set-cookie'];
  }); // 201

  it('LOGOUT without refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/logout').expect(401);
  }); // 401

  it('LOGOUT with incorrect refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/logout').set('Cookie', 'refreshToken=caramba').expect(401);
  }); // 401

  it('LOGOUT with correct refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/logout').set('Cookie', refreshToken).expect(201);
  }); // 201

  it('LOGIN with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'e2e user-agent')
      .send({
        email: 'someemail@gmail.com',
        password: 'Somepassword=1',
      })
      .expect(201);
  }); // 201

  it('PASSWORD RECOVERY with incorrect data (empty fiels)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: '',
      })
      .expect(400);
  }); // 400

  it('PASSWORD RECOVERY with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: '     ',
      })
      .expect(400);
  }); // 400

  it('PASSWORD RECOVERY with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 777,
      })
      .expect(400);
  }); // 400

  it('PASSWORD RECOVERY with incorrect data (pattern violation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'caramba',
      })
      .expect(400);
  }); // 400

  it('PASSWORD RECOVERY with incorrect data (non-existing value)', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'caramba@gmail.com',
      })
      .expect(400);
  }); // 400

  it('PASSWORD RECOVERY with correct data', async () => {
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

    recoveryCode = user!.accountData!.recoveryCode;
  }); // 201

  it('SET NEW PASSWORD with incorrect data (empty fiels)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: '',
        newPassword: '',
        passwordConfirmation: '',
      })
      .expect(400);
  }); // 400

  it('SET NEW PASSWORD with incorrect data (only whitespaces)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: '     ',
        newPassword: '     ',
        passwordConfirmation: '     ',
      })
      .expect(400);
  }); // 400

  it('SET NEW PASSWORD with incorrect data (wrong type)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: 777,
        newPassword: 777,
        passwordConfirmation: 777,
      })
      .expect(400);
  }); // 400

  it('SET NEW PASSWORD with incorrect data (pattern violation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: recoveryCode,
        newPassword: 'some password',
        passwordConfirmation: 'some password',
      })
      .expect(400);
  }); // 400

  it('SET NEW PASSWORD with incorrect data (non-existing value)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: 'caramba',
        newPassword: 'some password',
        passwordConfirmation: 'some password',
      })
      .expect(400);
  }); // 400

  it('SET NEW PASSWORD with incorrect data (mismatched passwords)', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: recoveryCode,
        newPassword: 'Somepassword=2',
        passwordConfirmation: 'Somepassword=3',
      })
      .expect(400);
  }); // 400

  it('SET NEW PASSWORD with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({
        code: recoveryCode,
        newPassword: 'Somepassword=2',
        passwordConfirmation: 'Somepassword=2',
      })
      .expect(201);
  }); // 201
});
