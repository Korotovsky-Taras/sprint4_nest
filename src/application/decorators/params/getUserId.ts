import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  if (request.userId === null) {
    throw new Error('Missing request data. Please check userId provided');
  }
  return request.userId;
});
