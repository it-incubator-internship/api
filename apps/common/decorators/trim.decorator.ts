import { Transform, TransformFnParams } from 'class-transformer';

// export const Trim = (): any => Transform(({ value }: TransformFnParams) => value?.trim());

export const Trim = (): any =>
  Transform(({ value }: TransformFnParams) => {
    if (typeof value !== 'string') {
      return;
    }
    return value.trim();
  });
