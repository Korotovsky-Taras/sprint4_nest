import setCookie from 'set-cookie-parser';
import { UUID } from 'crypto';
import { Response } from 'supertest';
import { AuthRefreshTokenPayload } from '../../src/features/auth/utils/tokenCreator.types';
import { AuthTokenCreator } from '../../src/features/auth/utils/tokenCreator';

export type Cookie = {
  value: string;
};

export type SessionUnit = {
  uuid: UUID;
  payload: AuthRefreshTokenPayload;
  refreshToken: string;
};

export class TestCookieUtils {
  private tokenCreator: AuthTokenCreator;

  constructor() {
    this.tokenCreator = new AuthTokenCreator();
  }

  refreshSessionCookie(cookie: Cookie | undefined, session: SessionUnit) {
    if (!cookie || !cookie.value) {
      throw Error('Refresh cookie error');
    }
    const payload: AuthRefreshTokenPayload | null = this.tokenCreator.verifyRefreshToken(cookie.value);
    if (payload) {
      session.payload = payload;
      session.refreshToken = cookie.value;
    }
  }

  createCookie(cookieObj: Object): string {
    return Object.entries(cookieObj)
      .map(([name, value]) => {
        return name + '=' + value;
      })
      .join(';');
  }

  extractCookie(res: Response, name: string): Cookie | undefined {
    const decodedCookies = setCookie.parse(res.headers['set-cookie'], {
      decodeValues: true, // default: true
    });
    return decodedCookies.find((cookie) => cookie.name === name);
  }
}
