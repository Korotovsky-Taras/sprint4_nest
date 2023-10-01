import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthSessionInfoDto } from '../../../features/auth/types/dto';

export const GetAuthSessionInfo = createParamDecorator((data: unknown, ctx: ExecutionContext): AuthSessionInfoDto => {
  const request = ctx.switchToHttp().getRequest();
  if (request.userId === null || request.deviceId === null) {
    throw new Error('Missing request data. Please check userId or deviceId provided');
  }
  return {
    userId: request.userId,
    deviceId: request.deviceId,
  };
});
