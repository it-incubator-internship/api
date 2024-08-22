import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const CurrentUserInformation = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return {userId: request.user.userId};
  }
)