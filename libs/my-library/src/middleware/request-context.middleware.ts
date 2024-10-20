import { randomUUID } from 'crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { AsyncLocalStorageService } from '../async-storage-service/async-local-storage.service';

export const REQUEST_ID_KEY = 'requestId';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private asyncLocalStorageService: AsyncLocalStorageService) {}
  use(req: Request, res: Response, next: NextFunction): void {
    let requestId = req.headers['x-request-id'] as string;

    if (!requestId) {
      requestId = randomUUID();
      req.headers['x-request-id'] = requestId;
    }
    res.setHeader('X-Request-Id', requestId);

    this.asyncLocalStorageService.start(() => {
      const store = this.asyncLocalStorageService.getStore();

      if (store) {
        store.set(REQUEST_ID_KEY, requestId);
      }

      next();
    });
  }
}
