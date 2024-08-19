import { IsEnum, IsNumber, IsString, Max, Min, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export enum Environments {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
  LOCAL = 'LOCAL',
  TEST = 'TEST',
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
  EMAIL: string;

  @IsString()
  EMAIL_PASS: string;

  @IsString()
  JWT_SECRET_ACCESS: string;

  @IsString()
  JWT_SECRET_REFRESH: string;

  @IsString()
  JWT_SECRET_CONF_CODE: string;

  @IsString()
  JWT_SECRET_RECOVERY_CODE: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
}
