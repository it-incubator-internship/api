import * as process from 'node:process';

import { Environments, validate } from './env_validate/env-class-validator';

export type EnvironmentVariable = { [key: string]: string | undefined };
export type ConfigurationType = ReturnType<typeof getConfig>;

const getConfig = (environmentVariables: EnvironmentVariable, currentEnvironment: Environments) => {
  return {
    apiSettings: {
      PORT: Number.parseInt(environmentVariables.PORT || '6666'),
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
      address: environmentVariables.ADDRESS_FOR_CORS as string,
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

  const allowedVariables = ['NODE_ENV', 'PORT', 'ADDRESS_FOR_CORS'];

  //Эти значения выводятся в сваггере
  const environmentVariables = getAllEnvironmentVariables(allowedVariables); //; process.env

  const currentEnvironment: Environments = environmentVariables.NODE_ENV as Environments;

  //Валидация переменных с помощью class validator
  validate(environmentVariables);

  return getConfig(environmentVariables, currentEnvironment);
};
