import setCookie from 'set-cookie-parser';
import { UUID } from 'crypto';
import { Response } from 'supertest';
import { AuthRefreshTokenPayload } from '../../src/features/auth/utils/tokenCreator.types';
import { AppTestProvider } from './useTestDescribeConfig';

export type Cookie = {
  value: string;
};

export type SessionUnit = {
  uuid: UUID;
  payload: AuthRefreshTokenPayload;
  refreshToken: string;
};

export class TestCookieUtils {
  constructor(private readonly config: AppTestProvider) {}

  refreshCookie(cookie: Cookie | undefined, session: SessionUnit) {
    if (!cookie || !cookie.value) {
      throw Error('Refresh cookie should not be empty');
    }
    const payload: AuthRefreshTokenPayload | null = this.config.getTokenCreator().verifyRefreshToken(cookie.value);

    if (!payload) {
      throw Error('Refresh token not verified');
    }

    session.payload = payload;
    session.refreshToken = cookie.value;
  }

  createCookie(cookieObj: Object): string {
    return Object.entries(cookieObj)
      .map(([name, value]) => {
        return name + '=' + value;
      })
      .join(';');
  }

  verifyRefreshToken(cookie: Cookie) {
    return this.config.getTokenCreator().verifyRefreshToken(cookie.value);
  }

  createRefreshToken(userId: string, deviceId: string) {
    return this.config.getTokenCreator().createRefreshToken(userId, deviceId);
  }

  extractCookie(res: Response, name: string): Cookie | undefined {
    const decodedCookies = setCookie.parse(res.headers['set-cookie'], {
      decodeValues: true, // default: true
    });
    return decodedCookies.find((cookie) => cookie.name === name);
  }
}
