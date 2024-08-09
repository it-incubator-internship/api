import { CustomError } from './custom-error';

export class ObjResult< T > {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: CustomError,
  ) {}

  public static Ok<U>(value?: U): ObjResult<U> {
    let parsedValue: any = true;

    if (Boolean(value) || Number(value) === 0) parsedValue = value;

    return new ObjResult<U>(true, parsedValue as unknown as U);
  }

  public static Err<U>(err: CustomError | string): ObjResult<U> {
    let error: CustomError = err as CustomError;

    if (typeof err === 'string') {
      error = new CustomError(err as string);
    }

    return new ObjResult<U>(false, null as U, error);
  }

  get value(): T {
    if (!this._value && Number(this._value) !== 0) throw new Error('Does not extract value from ObjResult');
    return this._value as T;
  }

  get error(): CustomError {
    if (!this._error) throw new Error('Does not extract error from ObjResult');
    return this._error;
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }
}

// export class ErrorResulter {
//   static proccesError<T>(error: CustomError): void {
//     console.log(error instanceof BadRequestError);
//     switch (true) {
//       case error instanceof BadRequestError:
//         throw error;
//     }
//   }
// }
