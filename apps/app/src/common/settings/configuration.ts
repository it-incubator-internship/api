import * as process from 'node:process';

import { Environments, validate } from './env_validate/env-class-validator';

export type EnvironmentVariable = { [key: string]: string | undefined };
export type ConfigurationType = ReturnType<typeof getConfig>;

const getConfig = (environmentVariables: EnvironmentVariable, currentEnvironment: Environments) => {
  return {
    apiSettings: {
      PORT: Number.parseInt(environmentVariables.PORT || '6666'),
      API_PREFIX: 'api/v1',
      RMQ_HOST: environmentVariables.RMQ_HOST,
    },

    jwtSetting: {
      accessTokenSecret: environmentVariables.JWT_SECRET_ACCESS as string,
      refreshTokenSecret: environmentVariables.JWT_SECRET_REFRESH as string,
      confirmationCodeSecret: environmentVariables.JWT_SECRET_CONFIRMATION_CODE as string,
      recoveryCodeSecret: environmentVariables.JWT_SECRET_RECOVERY_CODE as string,
      codeForEmailSecret: environmentVariables.JWT_SECRET_CODE_FOR_EMAIL as string,
      accessTokenLifeTime: environmentVariables.JWT_LIFE_TIME_ACCESS as string,
      refreshTokenLifeTime: environmentVariables.JWT_LIFE_TIME_REFRESH as string,
      confirmationCodeLifeTime: environmentVariables.JWT_LIFE_TIME_CONFIRMATION_CODE as string,
      recoveryCodeLifeTime: environmentVariables.JWT_LIFE_TIME_RECOVERY_CODE as string,
    },

    environmentSettings: {
      currentEnv: currentEnvironment,
      isProduction: currentEnvironment === Environments.PRODUCTION,
      isStaging: currentEnvironment === Environments.STAGING,
      isLocal: currentEnvironment === Environments.LOCAL,
      isTesting: currentEnvironment === Environments.TEST,
      isDevelopment: currentEnvironment === Environments.DEVELOPMENT,
    },

    mailSettings: {
      password: environmentVariables.GMAIL_PASS,
      email: environmentVariables.GMAIL_USER,
    },

    googleAuthorizationSettings: {
      clientID: environmentVariables.GOOGLE_CLIENT_ID,
      clientSecret: environmentVariables.GOOGLE_CLIENT_SECRET,
      callbackURL: environmentVariables.GOOGLE_CALLBACK_URL,
    },

    githubAuthorizationSettings: {
      clientID: environmentVariables.GITHUB_CLIENT_ID,
      clientSecret: environmentVariables.GITHUB_CLIENT_SECRET,
      callbackURL: environmentVariables.GITHUB_CALLBACK_URL,
    },

    recaptchaSettings: {
      recaptchaSecret: environmentVariables.RECAPTCHA_SECRET,
      recaptchaURL: 'https://www.google.com/recaptcha/api/siteverify',
    },

    fileMicroservice: {
      hostname: environmentVariables.FILE_MICROSERVICE_HOSTNAME,
      port: environmentVariables.FILE_MICROSERVICE_PORT,
      avatarPath: '/upload/avatar/',
    },

    getAllVariables: {
      ...environmentVariables,
    },
  };
};

const getEnvironmentVariable = (key: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is missing`);
  }
  return value;
};

export const getAllEnvironmentVariables = (allowedVariables: string[]): EnvironmentVariable =>
  allowedVariables.reduce((acc, key) => ({ ...acc, [key]: getEnvironmentVariable(key) }), {});

export const configuration = () => {
  console.log('PORT from process.env:', process.env.PORT);

  const allowedVariables = [
    'NODE_ENV',
    'PORT',
    //DATABASE
    'DATABASE_APP_URL',
    'SHADOW_DATABASE_URL',
    //JWT
    'JWT_SECRET_ACCESS',
    'JWT_SECRET_REFRESH',
    'JWT_SECRET_CONFIRMATION_CODE',
    'JWT_SECRET_RECOVERY_CODE',
    'JWT_SECRET_CODE_FOR_EMAIL',
    'JWT_LIFE_TIME_ACCESS',
    'JWT_LIFE_TIME_REFRESH',
    'JWT_LIFE_TIME_CONFIRMATION_CODE',
    'JWT_LIFE_TIME_RECOVERY_CODE',
    //MAIL
    'GMAIL_USER',
    'GMAIL_PASS',
    //OAUTH
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GITHUB_CALLBACK_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    //RECAPTCHA
    'RECAPTCHA_SECRET',
    //FILE_MICROSERVICE
    'FILE_MICROSERVICE_HOSTNAME',
    'FILE_MICROSERVICE_PORT',
    'RMQ_HOST',
  ];

  //Эти значения выводятся в сваггере
  const environmentVariables = getAllEnvironmentVariables(allowedVariables); //; process.env

  const currentEnvironment: Environments = environmentVariables.NODE_ENV as Environments;

  //Валидация переменных с помощью class validator
  validate(environmentVariables);

  return getConfig(environmentVariables, currentEnvironment);
};
