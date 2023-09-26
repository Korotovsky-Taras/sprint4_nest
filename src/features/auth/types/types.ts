import { WithId } from 'mongodb';
import { IUser } from '../../users/types/dao';

export type AuthLoginReqModel = {
  loginOrEmail: string;
  password: string;
};

export type AuthLoginRepoModel = Pick<AuthLoginReqModel, 'loginOrEmail' | 'password'> & { userAgent: string; ip: string };

export type AuthRefreshTokenRepoModel = {
  userId: string;
  deviceId: string;
  userAgent: string;
  ip: string;
};

export type AuthLogoutRepoModel = {
  userId: string;
  deviceId: string;
};

export type AuthRegisterModel = Pick<IUser, 'login' | 'email'> & { password: string };

export type AuthRegisterConfirmationModel = {
  code: string;
};

export type AuthNewPasswordCreationModel = {
  newPassword: string;
  recoveryCode: string;
};

export type AuthResendingEmailModel = {
  email: string;
};

export type AuthServiceResultModel = {
  success: boolean;
};

export type AuthAccessTokenPass = {
  token: string;
};

export type AuthRefreshTokenPass = {
  token: string;
  uuid: string;
  deviceId: string;
  expiredIn: string;
};

export type AuthAccessTokenPayload = {
  userId: string;
  expiredIn: string;
};

export type AuthTokenParts = {
  head: string;
  body: string;
  signature: string;
};

export type AuthRefreshTokenPayload = {
  userId: string;
  uuid: string;
  deviceId: string;
  expiredIn: string;
};

export type AuthAccessToken = Readonly<string>;
export type AuthRefreshToken = Readonly<string>;

export type AuthTokens = {
  accessToken: AuthAccessToken;
  refreshToken: AuthRefreshToken;
};

export type AuthSession = {
  userId: string;
  uuid: string;
  ip: string;
  userAgent: string;
  lastActiveDate: string;
};

export type AuthSessionCreateModel = Pick<AuthSession, 'userId' | 'uuid' | 'ip' | 'userAgent' | 'lastActiveDate'> & { deviceId: string };

export type AuthSessionRemoveModel = Pick<AuthSession, 'userId'> & { deviceId: string };

export type AuthSessionMongoModel = WithId<AuthSession>;

export type AuthSessionValidationModel = Pick<AuthSession, 'uuid'> & { deviceId: string };

export type AuthSessionViewModel = Pick<AuthSession, 'ip' | 'lastActiveDate'> & { title: string; deviceId: string };

export type AuthSessionDataModel = Pick<AuthSession, 'uuid' | 'userId'> & { deviceId: string };
