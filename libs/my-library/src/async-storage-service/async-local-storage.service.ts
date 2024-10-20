import { AsyncLocalStorage } from 'async_hooks';

import { Injectable } from '@nestjs/common';

const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

@Injectable()
export class AsyncLocalStorageService {
  private asyncLocalStorage = asyncLocalStorage;

  start(callback: () => void) {
    this.asyncLocalStorage.run(new Map(), () => {
      callback();
    });
  }

  getStore(): Map<string, any> | undefined {
    return this.asyncLocalStorage.getStore();
  }
}
