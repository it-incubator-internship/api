import { CustomError } from './custom-error';

export class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: CustomError,
  ) {}

  public static Ok<U>(value?: U): Result<U> {
    let parsedValue: any = true;

    if (Boolean(value) || Number(value) === 0) parsedValue = value;

    return new Result<U>(true, parsedValue as unknown as U);
  }

  public static Err<U>(err: CustomError | string): Result<U> {
    let error: CustomError = err as CustomError;

    if (typeof err === 'string') {
      error = new CustomError(err as string);
    }

    return new Result<U>(false, null, error);
  }

  get value(): T {
    if (!this._value && Number(this._value) !== 0) throw new Error('Does not extract value from Result');
    return this._value as T;
  }

  get error(): CustomError {
    if (!this._error) throw new Error('Does not extract error from Result');
    return this._error;
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }
}
