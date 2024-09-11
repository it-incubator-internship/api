import { IsEnum, IsNumber, IsString, Max, Min, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export enum Environments {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
  LOCAL = 'LOCAL',
  TEST = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environments)
  NODE_ENV: Environments;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  DATABASE_APP_URL: string;

  @IsString()
  JWT_SECRET_ACCESS: string;

  @IsString()
  JWT_SECRET_REFRESH: string;

  @IsString()
  JWT_SECRET_CONFIRMATION_CODE: string;

  @IsString()
  JWT_SECRET_RECOVERY_CODE: string;

  @IsString()
  SHADOW_DATABASE_URL: string;

  @IsString()
  JWT_LIFE_TIME_ACCESS: string;

  @IsString()
  JWT_LIFE_TIME_REFRESH: string;

  @IsString()
  JWT_LIFE_TIME_CONFIRMATION_CODE: string;

  @IsString()
  JWT_LIFE_TIME_RECOVERY_CODE: string;

  @IsString()
  RECAPTCHA_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
}
