import { IsEnum, IsNumber, IsString, Max, Min, MinLength, validateSync } from 'class-validator';
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
  @MinLength(5)
  MONGO_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
}
