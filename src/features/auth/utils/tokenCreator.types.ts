export type AuthAccessTokenPass = {
  token: string;
};

export type AuthRefreshTokenPass = {
  token: string;
  uuid: string;
  deviceId: string;
  expiredIn: Date;
};

export type AuthAccessTokenPayload = {
  userId: string;
  expiredIn: string;
};

export type AuthRefreshTokenPayload = {
  userId: string;
  uuid: string;
  deviceId: string;
  expiredIn: string;
};

export type AuthTokenParts = {
  head: string;
  body: string;
  signature: string;
};

export type AuthAccessToken = Readonly<string>;
export type AuthRefreshToken = Readonly<string>;

export type AuthTokens = {
  accessToken: AuthAccessToken;
  refreshToken: AuthRefreshToken;
};
