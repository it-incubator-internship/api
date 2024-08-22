import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const UserIdFromRequest = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();

  return { userId: request.user.userId };
});
