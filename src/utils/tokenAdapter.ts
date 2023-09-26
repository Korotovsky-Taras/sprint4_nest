import crypto from 'node:crypto';
import { appConfig } from './config';

import { withObjectValue } from './withUserId';
import { BinaryToTextEncoding, randomUUID } from 'crypto';
import { toIsoString } from './date';
import { AuthAccessTokenPass, AuthAccessTokenPayload, AuthRefreshTokenPass, AuthRefreshTokenPayload, AuthTokenParts } from '../features/auth/types/types';

const { tokenSecret } = appConfig;

const signatureDigest: BinaryToTextEncoding = 'base64url';

export const createAccessToken = (userId: string): AuthAccessTokenPass => {
  const expiredIn: Date = new Date();
  expiredIn.setTime(expiredIn.getTime() + 3 * 1000 * 60);
  return _createAccessToken(userId, toIsoString(expiredIn));
};

export const createRefreshToken = (userId: string, deviceId: string): AuthRefreshTokenPass => {
  const expiredIn: Date = new Date();
  expiredIn.setTime(expiredIn.getTime() + 30 * 1000 * 60);
  return _createRefreshToken(userId, deviceId, toIsoString(expiredIn));
};

const _createAccessToken = (userId: string, expiredIn: string): AuthAccessTokenPass => {
  const head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'jwt' })).toString('base64');
  const body = Buffer.from(JSON.stringify({ userId, expiredIn })).toString('base64');
  const signature = crypto.createHmac('SHA256', tokenSecret).update(`${head}.${body}`).digest(signatureDigest);

  return {
    token: `${head}.${body}.${signature}`,
  };
};

const _createRefreshToken = (userId: string, deviceId: string, expiredIn: string): AuthRefreshTokenPass => {
  const uuid = randomUUID();

  const head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'jwt' })).toString('base64');
  const body = Buffer.from(JSON.stringify({ userId, expiredIn, deviceId, uuid })).toString('base64');
  const signature = crypto.createHmac('SHA256', tokenSecret).update(`${head}.${body}`).digest(signatureDigest);

  return {
    token: `${head}.${body}.${signature}`,
    uuid,
    deviceId,
    expiredIn,
  };
};

export const verifyRefreshToken = (token: string): AuthRefreshTokenPayload | null => {
  const tokenParts: AuthTokenParts | null = _getTokenParts(token);

  if (!tokenParts) {
    return null;
  }

  if (!_isValidTokenSignature(tokenParts)) {
    return null;
  }

  const payload: AuthRefreshTokenPayload | null = _getRefreshTokenPayload(tokenParts.body);

  if (!payload || _isExpiredToken(payload.expiredIn)) {
    return null;
  }

  return payload;
};

export const verifyAccessToken = (token: string): AuthAccessTokenPayload | null => {
  const tokenParts: AuthTokenParts | null = _getTokenParts(token);

  if (!tokenParts) {
    return null;
  }

  if (!_isValidTokenSignature(tokenParts)) {
    return null;
  }

  const payload: AuthAccessTokenPayload | null = _getAccessTokenPayload(tokenParts.body);

  if (!payload || _isExpiredToken(payload.expiredIn)) {
    return null;
  }

  return payload;
};

const _getTokenParts = (token: string): AuthTokenParts | null => {
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
};

const _isValidTokenSignature = (tokenParts: AuthTokenParts): boolean => {
  const signature = crypto.createHmac('SHA256', tokenSecret).update(`${tokenParts.head}.${tokenParts.body}`).digest(signatureDigest);

  return signature === tokenParts.signature;
};

const _isExpiredToken = (expiredIn: string): boolean => {
  return new Date(expiredIn).getTime() < new Date().getTime();
};

const _getAccessTokenPayload = (payload: string): AuthAccessTokenPayload | null => {
  const buffer = Buffer.from(payload, 'base64');
  const json = JSON.parse(buffer.toString());

  const userId = withObjectValue(json, 'userId');
  const expiredIn = withObjectValue(json, 'expiredIn');

  if (userId && expiredIn) {
    return { userId, expiredIn };
  }
  return null;
};

const _getRefreshTokenPayload = (payload: string): AuthRefreshTokenPayload | null => {
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
};
