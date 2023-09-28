import crypto from 'node:crypto';

import { BinaryToTextEncoding } from 'crypto';
import { appConfig } from '../../../application/utils/config';
import { AuthTokenParts } from './tokenCreator.types';

const { tokenSecret } = appConfig;

const signatureDigest: BinaryToTextEncoding = 'base64url';

export class AuthTokenCreatorAbstract {
  _verifyToken<T extends { expiredIn: string }>(token: string, payloadAction: (body: string) => T | null): T | null {
    const tokenParts: AuthTokenParts | null = this._getTokenParts(token);

    if (!tokenParts) {
      return null;
    }

    if (!this._isValidTokenSignature(tokenParts)) {
      return null;
    }

    const payload: T | null = payloadAction(tokenParts.body);

    if (payload === null || this._isExpiredToken(payload.expiredIn)) {
      return null;
    }

    return payload;
  }

  _getTokenParts(token: string): AuthTokenParts | null {
    if (!token) {
      return null;
    }

    const tokenParts = token.split('.');

    if (tokenParts.length < 3) {
      return null;
    }
    return {
      head: tokenParts[0],
      body: tokenParts[1],
      signature: tokenParts[2],
    };
  }

  _isValidTokenSignature(tokenParts: AuthTokenParts): boolean {
    const signature = crypto.createHmac('SHA256', tokenSecret).update(`${tokenParts.head}.${tokenParts.body}`).digest(signatureDigest);
    return signature === tokenParts.signature;
  }

  _isExpiredToken(expiredIn: string): boolean {
    return new Date(expiredIn).getTime() < new Date().getTime();
  }
}
