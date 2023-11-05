import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthTokenCreator } from '../../features/auth/utils/tokenCreator';
import { AuthHelper } from '../authHelper';
import { AuthDataMapper } from '../../features/auth/api/auth.dm';
import { AuthRefreshTokenPayload } from '../../features/auth/utils/tokenCreator.types';
import { AuthRepoQueryKey, IAuthSessionQueryRepository } from '../../features/auth/types/common';

@Injectable()
export class AuthSessionGuard implements CanActivate {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly tokenCreator: AuthTokenCreator,
    @Inject(AuthRepoQueryKey) private readonly authQueryRepo: IAuthSessionQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const refreshToken: string | null = this.authHelper.getRefreshToken(request);

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const tokenPass: AuthRefreshTokenPayload | null = this.tokenCreator.verifyRefreshToken(refreshToken);

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
