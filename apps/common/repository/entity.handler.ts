import { EntityFactory } from '../../app/src/features/user/user/domain/account-data.entity';

import { EntityEnum } from './base.repository';

export class EntityHandler {
  //entity: EntityEnum;
  constructor(/* value: EntityEnum */) {
    //this.entity = value;
  }
  getEntityClass({ model }: { model: string }) {
    console.log('model in entity handler:', model);
    switch (model) {
      case EntityEnum.user:
        console.log('user');
        return EntityFactory.createUser;
      case EntityEnum.accountData:
        console.log('accountData');
        return EntityFactory.createAccountData;
      case EntityEnum.session:
        console.log('session');
        return EntityFactory.createSession;
      default:
        console.log('I am teapot');
    }
  }
}
