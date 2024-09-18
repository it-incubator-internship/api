import { Environments } from './env_validate/env-class-validator';

export function isEnvFileIgnored(env: Environments): boolean {
  return env !== Environments.DEVELOPMENT && env !== Environments.TEST;
}

export function getEnvFilePath(env: Environments): string[] {
  console.log(env);
  const defaultEnvFilePath = ['.development.files.env', '.local.env', '.env'];
  return env === Environments.TEST ? ['.test.files.env', ...defaultEnvFilePath] : defaultEnvFilePath;
}
