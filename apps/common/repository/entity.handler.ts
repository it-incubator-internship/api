import { EntityFactory } from '../../app/src/features/user/user/domain/account-data.entity';

import { EntityEnum } from './base.repository';

export class EntityHandler {
  getEntityClass({ model, entity }: { model: string; entity: any }) {
    switch (model) {
      case EntityEnum.user:
        return EntityFactory.createUser(entity);
      case EntityEnum.accountData:
        return EntityFactory.createAccountData(entity);
      case EntityEnum.session:
        return EntityFactory.createSession(entity);
      case EntityEnum.profile:
        return EntityFactory.createProfile(entity);
    }
  }
}
