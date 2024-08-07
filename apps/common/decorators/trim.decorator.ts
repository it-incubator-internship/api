import { Transform, TransformFnParams } from 'class-transformer';

export const Trim = (): any => Transform(({ value }: TransformFnParams) => value?.trim());
