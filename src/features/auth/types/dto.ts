import { IAuthSession } from './dao';

export type AuthSessionInfoModel = Pick<IAuthSession, 'userId' | 'deviceId'>;

export type AuthLoginInputModel = { userAgent: string; ip: string; loginOrEmail: string; password: string };

export type AuthSessionCreateModel = Pick<IAuthSession, 'userId' | 'uuid' | 'ip' | 'userAgent' | 'deviceId' | 'lastActiveDate'>;

export type AuthRefreshTokenInputModel = Pick<IAuthSession, 'userId' | 'ip' | 'userAgent' | 'deviceId'>;

export type AuthSessionUpdateModel = Pick<IAuthSession, 'uuid' | 'ip' | 'userAgent' | 'lastActiveDate'>;

export type AuthSessionValidationModel = Pick<IAuthSession, 'uuid' | 'deviceId'>;

export type AuthSessionViewModel = Pick<IAuthSession, 'ip' | 'deviceId'> & { title: string; lastActiveDate: string };

export type AuthSessionDataModel = Pick<IAuthSession, 'uuid' | 'userId' | 'deviceId'>;
