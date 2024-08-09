export enum ErrorStatus {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  SERVER_ERROR = 'SERVER_ERROR',
}

export class CustomError extends Error {
  constructor(
    public readonly _message: string,
    public readonly _code?: ErrorStatus,
  ) {
    super(_message);
  }

  getCode(): ErrorStatus {
    return this._code!;
  }

  getMessage(): string {
    return this._message;
  }
}

export class BadRequestError extends CustomError {
  private readonly _fields: string;

  constructor(mes: string, fields: string) {
    super(mes, ErrorStatus.BAD_REQUEST);
    this._fields = fields;
  }

  getError() {
    return this.getViewError();
  }

  private getViewError() {
    return [
      {
        message: this._message,
        fields: this._fields,
      },
    ];
  }
}

export class UnauthorizedError extends CustomError {
  constructor(mes: string) {
    super(mes, ErrorStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends CustomError {
  constructor(mes: string) {
    super(mes, ErrorStatus.FORBIDDEN);
  }
}

export class NotFoundError extends CustomError {
  constructor(mes: string) {
    super(mes, ErrorStatus.NOT_FOUND);
  }
}
