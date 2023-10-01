import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { appConfig } from '../utils/config';
import { getRequestAuthorization } from './utils/getRequestAuthorization';

@Injectable()
export class AuthBasicGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authData = getRequestAuthorization(request, 'Basic');

    if (!authData || !this.isValidAuth(authData)) {
      throw new UnauthorizedException();
    }
    return true;
  }

  isBase64(text: string): boolean {
    return new RegExp(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, 'gi').test(text);
  }

  isValidAuth(basicAuth: string): boolean {
    if (!this.isBase64(basicAuth)) {
      return false;
    }
    const authData = atob(basicAuth);
    if (authData.includes(':')) {
      const [login, password] = authData.split(':');
      const { authLogin, authPassword } = appConfig;
      if (login.toLowerCase() === authLogin.toLowerCase() && password.toLowerCase() === authPassword.toLowerCase()) {
        return true;
      }
    }
    return false;
  }
}
