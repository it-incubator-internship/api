import { Environments, validate } from './env_validate/env-class-validator';
import * as process from 'node:process';

export type EnvironmentVariable = { [key: string]: string | undefined };
export type ConfigurationType = ReturnType<typeof getConfig>;

const getConfig = (environmentVariables: EnvironmentVariable, currentEnvironment: Environments) => {
  return {
    apiSettings: {
      PORT: Number.parseInt(environmentVariables.PORT || '6666'),
      API_PREFIX: '/api-v2/3.0',
    },

    environmentSettings: {
      currentEnv: currentEnvironment,
      isProduction: currentEnvironment === Environments.PRODUCTION,
      isStaging: currentEnvironment === Environments.STAGING,
      isLocal: currentEnvironment === Environments.LOCAL,
      isTesting: currentEnvironment === Environments.TEST,
      isDevelopment: currentEnvironment === Environments.DEVELOPMENT,
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
  console.log('Configuration function called. NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT from process.env:', process.env.PORT);

  const allowedVariables = ['NODE_ENV', 'PORT'];

  //Эти значения выводятся в сваггере
  const environmentVariables = getAllEnvironmentVariables(allowedVariables); //; process.env

  const currentEnvironment: Environments = environmentVariables.NODE_ENV as Environments;
  //Валидация переменных с помощью class validator
  validate(environmentVariables);

  return getConfig(environmentVariables, currentEnvironment);
};