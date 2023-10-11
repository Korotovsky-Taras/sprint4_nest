import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppConfiguration, AppConfigurationAuth } from '../utils/config';
import { getRequestAuthorization } from './utils/getRequestAuthorization';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthBasicGuard implements CanActivate {
  private env: AppConfigurationAuth;

  constructor(private readonly configService: ConfigService<AppConfiguration, true>) {
    this.env = configService.get<AppConfigurationAuth>('auth');
  }

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
      if (login === this.env.AUTH_LOGIN && password === this.env.AUTH_PASSWORD) {
        return true;
      }
    }
    return false;
  }
}
