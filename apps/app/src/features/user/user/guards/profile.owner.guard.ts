import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ForbiddenError } from '../../../../../../common/utils/result/custom-error';

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class ProfileOwnerGuard implements CanActivate {
  constructor() {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // получение userId из param
    const userIdFromParam = request.params.id;

    // получение userId из accessToken
    const userIdFromRequest = request.user.userId;

    if (userIdFromParam !== userIdFromRequest) {
      // TODO добавить в logger
      throw new ForbiddenError('user do not have permission');
    }

    return true;
  }
}
