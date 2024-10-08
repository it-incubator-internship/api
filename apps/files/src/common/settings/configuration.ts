import * as process from 'node:process';

import { Environments, validate } from './env_validate/env-class-validator';

export type EnvironmentVariable = { [key: string]: string | undefined };
export type ConfigurationType = ReturnType<typeof getConfig>;

const getConfig = (environmentVariables: EnvironmentVariable, currentEnvironment: Environments) => {
  return {
    apiSettings: {
      PORT: Number.parseInt(environmentVariables.PORT || '6666'),
      RMQ_HOST: environmentVariables.RMQ_HOST,
    },

    environmentSettings: {
      currentEnv: currentEnvironment,
      isProduction: currentEnvironment === Environments.PRODUCTION,
      isStaging: currentEnvironment === Environments.STAGING,
      isLocal: currentEnvironment === Environments.LOCAL,
      isTesting: currentEnvironment === Environments.TEST,
      isDevelopment: currentEnvironment === Environments.DEVELOPMENT,
    },

    addressSettings: {
      address: 'https://navaibe.ru/',
    },

    databaseSettings: {
      uri: environmentVariables.MONGO_URL,
    },

    cloudSettings: {
      address: 'https://storage.yandexcloud.net',
      secretAccessKey: environmentVariables.CLOUD_SECRET_ACCESS_KEY as string,
      accessKeyId: environmentVariables.CLOUD_ACCESS_KEY_ID as string,
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
    'MONGO_URL',
    'CLOUD_SECRET_ACCESS_KEY',
    'CLOUD_ACCESS_KEY_ID',
    'RMQ_HOST',
  ];

  //Эти значения выводятся в сваггере
  const environmentVariables = getAllEnvironmentVariables(allowedVariables); //; process.env

  const currentEnvironment: Environments = environmentVariables.NODE_ENV as Environments;

  //Валидация переменных с помощью class validator
  validate(environmentVariables);

  return getConfig(environmentVariables, currentEnvironment);
};
