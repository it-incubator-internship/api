import {
  AccountDataEntityNEW,
  SessionEntityNEW,
  UserEntityNEW,
} from 'apps/app/src/features/user/user/domain/account-data.entity';

import { EntityEnum } from './base.repository';

export class EntityHandler {
  entity: EntityEnum;
  constructor(value: EntityEnum) {
    this.entity = value;
  }
  getEntityClass({ model }: { model: string }) {
    switch (model) {
      case EntityEnum.user:
        console.log('UserEntityNEW');
        return UserEntityNEW;
      case EntityEnum.accountData:
        console.log('AccountDataEntityNEW');
        return AccountDataEntityNEW;
      case EntityEnum.session:
        console.log('SessionEntityNEW');
        return SessionEntityNEW;
      default:
        console.log('I am teapot');
    }
  }
}
