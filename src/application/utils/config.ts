import { ServerApiVersion } from 'mongodb';

export type AppConfigurationAuth = {
  AUTH_LOGIN: string;
  AUTH_PASSWORD: string;
  TOKEN_SK: string;
};

export type AppConfigurationMongo = {
  URI: string;
  TEST_URI: string;
  DB_NAME: string;
  DB_VER: ServerApiVersion;
};

export type AppConfigurationGmail = {
  CLIENT_URL: string;
  EMAIL: string;
  PASSWORD: string;
};

export type AppConfiguration = {
  PORT: number;
  auth: AppConfigurationAuth;
  mongo: AppConfigurationMongo;
  gmail: AppConfigurationGmail;
};

export function getEnvFilePath() {
  if (process.env.NODE_ENV !== 'production') {
    return `.env.development`;
  }
  return '.env';
}

export const getConfiguration = (): AppConfiguration => {
  return {
    PORT: Number(process.env.PORT) || 80,
    auth: {
      AUTH_LOGIN: process.env.AUTH_LOGIN || '',
      AUTH_PASSWORD: process.env.AUTH_PASSWORD || '',
      TOKEN_SK: process.env.TOKEN_SK || 'secret',
    },
    mongo: {
      URI: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
      TEST_URI: process.env.MONGO_TEST_URL || 'mongodb://0.0.0.0:27017',
      DB_NAME: process.env.NODE_ENV || 'development',
      DB_VER: ServerApiVersion.v1,
    },
    gmail: {
      CLIENT_URL: process.env.MAIL_CLIENT_URL || '',
      EMAIL: process.env.MAIL_ADAPTER_USER || '',
      PASSWORD: process.env.MAIL_ADAPTER_PASS || '',
    },
  };
};
