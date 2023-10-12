import crypto from 'node:crypto';

import { BinaryToTextEncoding, randomUUID } from 'crypto';
import { AppConfiguration, AppConfigurationAuth } from '../../../application/utils/config';
import { toIsoString } from '../../../application/utils/date';
import { AuthAccessTokenPass, AuthAccessTokenPayload, AuthRefreshTokenPass, AuthRefreshTokenPayload } from './tokenCreator.types';
import { AuthTokenCreatorAbstract } from './tokenCreatorAbstract';
import { withObjectValue } from '../../../application/utils/withUserId';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const signatureDigest: BinaryToTextEncoding = 'base64url';

@Injectable()
export class AuthTokenCreator extends AuthTokenCreatorAbstract {
  private readonly env: AppConfigurationAuth;

  constructor(private readonly configService: ConfigService<AppConfiguration, true>) {
    super();

    this.env = configService.get<AppConfigurationAuth>('auth');
  }

  getAuthEnv(): AppConfigurationAuth {
    return this.env;
  }

  createAccessToken(userId: string): AuthAccessTokenPass {
    const expiredIn: Date = new Date();
    expiredIn.setTime(expiredIn.getTime() + 10 * 60);

    const head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'jwt' })).toString('base64');
    const body = Buffer.from(JSON.stringify({ userId, expiredIn: toIsoString(expiredIn) })).toString('base64');
    const signature = crypto.createHmac('SHA256', this.env.TOKEN_SK).update(`${head}.${body}`).digest(signatureDigest);

    return {
      token: `${head}.${body}.${signature}`,
    };
  }
  createRefreshToken(userId: string, deviceId: string): AuthRefreshTokenPass {
    const expiredIn: Date = new Date();
    expiredIn.setTime(expiredIn.getTime() + 20 * 60);

    const uuid = randomUUID();

    const head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'jwt' })).toString('base64');
    const body = Buffer.from(JSON.stringify({ userId, expiredIn: toIsoString(expiredIn), deviceId, uuid })).toString('base64');
    const signature = crypto.createHmac('SHA256', this.env.TOKEN_SK).update(`${head}.${body}`).digest(signatureDigest);

    return {
      token: `${head}.${body}.${signature}`,
      uuid,
      deviceId,
      expiredIn,
    };
  }

  verifyRefreshToken(token: string): AuthRefreshTokenPayload | null {
    return this._verifyToken<AuthRefreshTokenPayload>(token, this._getRefreshTokenPayload);
  }
  verifyAccessToken(token: string): AuthAccessTokenPayload | null {
    return this._verifyToken<AuthAccessTokenPayload>(token, this._getAccessTokenPayload);
  }

  private _getAccessTokenPayload(body: string): AuthAccessTokenPayload | null {
    const buffer = Buffer.from(body, 'base64');
    const json = JSON.parse(buffer.toString());

    const userId = withObjectValue(json, 'userId');
    const expiredIn = withObjectValue(json, 'expiredIn');

    if (userId && expiredIn) {
      return { userId, expiredIn };
    }
    return null;
  }

  private _getRefreshTokenPayload(payload: string): AuthRefreshTokenPayload | null {
    const buffer = Buffer.from(payload, 'base64');
    const json = JSON.parse(buffer.toString());

    const uuid = withObjectValue(json, 'uuid');
    const userId = withObjectValue(json, 'userId');
    const expiredIn = withObjectValue(json, 'expiredIn');
    const deviceId = withObjectValue(json, 'deviceId');

    if (userId && deviceId && uuid && expiredIn) {
      return { userId, deviceId, uuid, expiredIn };
    }
    return null;
  }
}
