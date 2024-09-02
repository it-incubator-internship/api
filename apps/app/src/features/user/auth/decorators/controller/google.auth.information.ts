import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GoogleAuthInformation = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();

  return {
    googleId: request.user.googleId,
    email: request.user.email,
    emailVerification: request.user.emailVerification,
  };
});
