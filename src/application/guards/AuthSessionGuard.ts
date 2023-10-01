import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthTokenCreator } from '../../features/auth/utils/tokenCreator';
import { AuthSessionQueryRepository } from '../../features/auth/dao/auth.query.repository';
import { AuthHelper } from '../authHelper';
import { AuthDataMapper } from '../../features/auth/api/auth.dm';

@Injectable()
export class AuthSessionGuard implements CanActivate {
  constructor(
    private authHelper: AuthHelper,
    private tokenCreator: AuthTokenCreator,
    private authQueryRepo: AuthSessionQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const refreshToken: string | null = this.authHelper.getRefreshToken(request);

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const tokenPass = this.tokenCreator.verifyRefreshToken(refreshToken);

    if (tokenPass == null) {
      throw new UnauthorizedException();
    }

    const session = await this.authQueryRepo.getSessionByUserIdDeviceId(tokenPass.userId, tokenPass.deviceId, AuthDataMapper.toSessionValidate);

    if (session === null || session.uuid !== tokenPass.uuid) {
      throw new UnauthorizedException();
    }

    request.userId = tokenPass.userId;
    request.deviceId = tokenPass.deviceId;

    return true;
  }
}
