import { IAuthSession } from './dao';
import { IUser } from '../../users/types/dao';

export type AuthSessionInfoDto = Pick<IAuthSession, 'userId' | 'deviceId'>;

export type AuthLoginInputDto = { userAgent: string; ip: string; loginOrEmail: string; password: string };

export type AuthConfirmationCodeDto = { code: string };

export type AuthResendingEmailInputDto = { email: string };

export type AuthNewPasswordInputDto = { newPassword: string; recoveryCode: string };

export type AuthRegisterInputDto = Pick<IUser, 'login' | 'email'> & { password: string };

export type AuthSessionCreateDto = Pick<IAuthSession, 'userId' | 'uuid' | 'ip' | 'userAgent' | 'deviceId' | 'lastActiveDate'>;

export type AuthSessionLogoutInputDto = Pick<IAuthSession, 'userId' | 'deviceId'>;

export type AuthRefreshTokenInputDto = Pick<IAuthSession, 'userId' | 'ip' | 'userAgent' | 'deviceId'>;

export type AuthSessionUpdateDto = Pick<IAuthSession, 'uuid' | 'ip' | 'userAgent' | 'lastActiveDate'>;

export type AuthSessionValidationDto = Pick<IAuthSession, 'uuid' | 'deviceId'>;

export type AuthSessionViewDto = Pick<IAuthSession, 'ip' | 'deviceId'> & { title: string; lastActiveDate: string };

export type AuthSessionDataDto = Pick<IAuthSession, 'uuid' | 'userId' | 'deviceId'>;
