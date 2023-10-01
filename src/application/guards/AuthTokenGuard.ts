import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthTokenCreator } from '../../features/auth/utils/tokenCreator';
import { getRequestAuthorization } from './utils/getRequestAuthorization';
import { Reflector } from '@nestjs/core';
import { TokenGuardParamType } from '../decorators/skipTokenError';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  private throwError: boolean = true;
  private tokenCreator: AuthTokenCreator;

  constructor(private readonly reflector: Reflector) {
    this.tokenCreator = new AuthTokenCreator();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    this.initErrorParams(context);

    const request = context.switchToHttp().getRequest();

    const authData = getRequestAuthorization(request, 'Bearer');

    if (authData) {
      const verifiedAccessToken = this.tokenCreator.verifyAccessToken(authData);

      if (verifiedAccessToken) {
        request.userId = verifiedAccessToken.userId;
      } else if (this.throwError) {
        throw new UnauthorizedException();
      }
    } else if (this.throwError) {
      throw new UnauthorizedException();
    }

    return true;
  }

  initErrorParams(context: ExecutionContext) {
    const params = this.reflector.get<TokenGuardParamType>('tokenGuardParams', context.getHandler());

    this.throwError = true;

    if (params) {
      this.throwError = params.throwError;
    }
  }
}
