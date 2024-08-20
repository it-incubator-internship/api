import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { EmailAdapter } from '../src/features/user/auth/email.adapter/email.adapter';
import { EmailAdapterMock } from '../src/features/user/auth/email.adapter/email.adapte.mock';
import { appSettings } from '../src/common/settings/apply-app-setting';
import { PrismaService } from '../src/common/database_module/prisma-connection.service';

// jest.setTimeout(10000); // увеличение времени ожидания

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let confirmationCode_1;
  let confirmationCode_2;
  let recoveryCode;
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

    const user = await prisma.user.findFirst({
      where: {
        email: 'someemail@gmail.com',
      },
      include: {
        accountData: true,
      },
    });
  
    confirmationCode_1 = user!.accountData!.confirmationCode
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
  }); // 404

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

    confirmationCode_2 = user!.accountData!.confirmationCode
  }); // 201



  it.skip('REGISTRATION CONFIRMATION with incorrect data (old confirmation code)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: confirmationCode_1,
      })
      .expect(404);
  }); // 404

  it('REGISTRATION CONFIRMATION with correct data', async () => {
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
  }); // 400



  it('REGISTRATION EMAIL RESENDING with incorrect data (email has already been confirmed)', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: 'someemail@gmail.com',
      })
      .expect(400);
  }); // 400



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
