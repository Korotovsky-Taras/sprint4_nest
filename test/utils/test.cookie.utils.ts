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

  refreshCookie(cookie: Cookie | undefined, session: SessionUnit) {
    if (!cookie || !cookie.value) {
      throw Error('Refresh cookie should not be empty');
    }
    const payload: AuthRefreshTokenPayload | null = this.tokenCreator.verifyRefreshToken(cookie.value);

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
    return this.tokenCreator.verifyRefreshToken(cookie.value);
  }

  createRefreshToken(userId: string, deviceId: string) {
    return this.tokenCreator.createRefreshToken(userId, deviceId);
  }

  extractCookie(res: Response, name: string): Cookie | undefined {
    const decodedCookies = setCookie.parse(res.headers['set-cookie'], {
      decodeValues: true, // default: true
    });
    return decodedCookies.find((cookie) => cookie.name === name);
  }
}
