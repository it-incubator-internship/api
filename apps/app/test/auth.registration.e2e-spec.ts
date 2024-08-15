import request from 'supertest';
// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import { EmailAdapter } from '../src/features/user/auth/email.adapter/email.adapter';
// import { EmailAdapterMock } from '../src/features/user/auth/email.adapter/email.adapte.mock';
// import { AppModule } from '../src/app.module';
// import { appSettings } from '../src/common/settings/apply-app-setting';
// import { appSettings } from '../app.setting';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { EmailAdapter } from '../src/features/user/auth/email.adapter/email.adapter';
import { EmailAdapterMock } from '../src/features/user/auth/email.adapter/email.adapte.mock';
import { appSettings } from '../src/common/settings/apply-app-setting';

// jest.setTimeout(10000); // увеличение времени ожидания

describe('Auth e2e', () => {
  let app: INestApplication;
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

    httpServer = app.getHttpServer();

    // await request(app.getHttpServer())
    //     .delete('/testing/all-data')
    //     .expect(204)
  });

  afterAll(async () => {
    await app.close();
  });

  it('REGISTRATION with incorrect data (empty fields)', async () => {
    /*const response = */ await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: '',
        password: '',
        passwordConfirmation: '',
        email: '',
        isAgreement: true,
      })
      .expect(400);

    // expect(response.body).toEqual({
    //     errorsMessages: [
    //         {message: 'The login has incorrect values', field: 'login'},
    //         {message: 'The password has incorrect values', field: 'password'},
    //         {message: 'The email has incorrect values', field: 'email'},
    //     ]
    // })
  }); // 400

  it('REGISTRATION with incorrect data (only whitespaces)', async () => {
    /* const response = */ await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: '     ',
        password: '     ',
        passwordConfirmation: '     ',
        email: '     ',
        isAgreement: true,
      })
      .expect(400);

    // expect(response.body).toEqual({
    //     errorsMessages: [
    //         {message: 'The login has incorrect values', field: 'login'},
    //         {message: 'The password has incorrect values', field: 'password'},
    //         {message: 'The email has incorrect values', field: 'email'},
    //     ]
    // })
  }); // 400

  it('REGISTRATION with incorrect data (wrong type)', async () => {
    /* const response = */ await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 777,
        password: 777,
        passwordConfirmation: 777,
        email: 777,
        isAgreement: true,
      })
      .expect(400);

    //         expect(response.body).toEqual({
    //             errorsMessages: [
    //                 {message: 'The login has incorrect values', field: 'login'},
    //                 {message: 'The password has incorrect values', field: 'password'},
    //                 {message: 'The email has incorrect values', field: 'email'},
    //             ]
    //         })
  }); // 400

  it('REGISTRATION with incorrect data (small length)', async () => {
    /* const response = */ await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'short',
        password: 'Sh0=1',
        passwordConfirmation: 'Sh0=1',
        email: 'someemail@mail.com',
        isAgreement: true,
      })
      .expect(400);

    // expect(response.body).toEqual({
    //     errorsMessages: [
    //         {message: 'The login has incorrect values', field: 'login'},
    //         {message: 'The password has incorrect values', field: 'password'},
    //     ]
    // })
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
    /* const response = */ await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someusernamewithalonglength',
        password: 'Somepasswordwithalooonglength=1',
        passwordConfirmation: 'Somepasswordwithalooonglength=1',
        email: 'someemail@mail.com',
        isAgreement: true,
      })
      .expect(400);

    // expect(response.body).toEqual({
    //     errorsMessages: [
    //         {message: 'The login has incorrect values', field: 'login'},
    //         {message: 'The password has incorrect values', field: 'password'},
    //     ]
    // })
  }); // 400

  //     it.skip('REGISTRATION with correct data (sixth request within 10 seconds)', async () => {

  //         await request(app.getHttpServer())
  //             .post('/auth/registration')
  //             .send({
  //                 login: 'somelogin',
  //                 password: 'somepassword',
  //                 email: 'alexeyermolin94@gmail.com',
  //             })
  //             .expect(429)

  //     }) // 429

  it('REGISTRATION with incorrect data (pattern violation)', async () => {
    /* const response = */ await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'some user name',
        password: 'some password',
        passwordConfirmation: 'some password',
        email: 'someemail@mail.com',
        isAgreement: true,
      })
      .expect(400);

    // expect(response.body).toEqual({
    //     errorsMessages: [
    //         {message: 'The login has incorrect values', field: 'login'},
    //         {message: 'The email has incorrect values', field: 'email'},
    //     ]
    // })
  }); // 400

  it('REGISTRATION with incorrect data (isAgreement: false)', async () => {
    /* const response = */ await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someusername',
        password: 'Somepassword=1',
        passwordConfirmation: 'Somepassword=1',
        email: 'someemail@gmail.com',
        isAgreement: false,
      })
      .expect(400);

    // expect(response.body).toEqual({
    //     errorsMessages: [
    //         {message: 'The login has incorrect values', field: 'login'},
    //         {message: 'The email has incorrect values', field: 'email'},
    //     ]
    // })
  }); // 400

  it.skip('REGISTRATION with correct data', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: '           someUserName           ',
        password: '     SomePassword=1     ',
        passwordConfirmation: '     SomePassword=1     ',
        email: ' someEmail@gmail.com ',
        isAgreement: true,
      })
      .expect(201);
  }); // 201

  it.skip('REGISTRATION with correct data', async () => {
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
  }); // 201

  it.skip('REGISTRATION with incorrect data (re-registration with repeated userName)', async () => {
    /* const response = */ await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someusername',
        password: 'Somepassword=1',
        passwordConfirmation: 'Somepassword=1',
        email: 'someanotheremail@mail.com',
        isAgreement: true,
      })
      .expect(400);

    // expect(response.body).toEqual({
    //     errorsMessages: [
    //         {message: 'This login is already used', field: 'login'},
    //         {message: 'This email is already used', field: 'email'}
    //     ]
    // })
  }); // 400

  it.skip('REGISTRATION with incorrect data (re-registration with repeated email)', async () => {
    /* const response = */ await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        userName: 'someanotherlogin',
        password: 'Somepassword=1',
        passwordConfirmation: 'Somepassword=1',
        email: 'someemail@gmail.com',
        isAgreement: true,
      })
      .expect(400);

    // expect(response.body).toEqual({
    //     errorsMessages: [
    //         {message: 'This login is already used', field: 'login'},
    //         {message: 'This email is already used', field: 'email'}
    //     ]
    // })
  }); // 400
});
