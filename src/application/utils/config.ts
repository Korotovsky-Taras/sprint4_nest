import { ServerApiVersion } from 'mongodb';

export type AppDbType = 'SQLRaw' | 'Mongo';

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

export type AppConfigurationSql = {
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASS: string;
};

export type AppConfigurationGmail = {
  CLIENT_URL: string;
  EMAIL: string;
  PASSWORD: string;
};

export type AppConfiguration = {
  DB_TYPE: AppDbType;
  PORT: number;
  auth: AppConfigurationAuth;
  mongo: AppConfigurationMongo;
  sql: AppConfigurationSql;
  gmail: AppConfigurationGmail;
};

export function getEnvFilePath() {
  if (process.env.NODE_ENV == 'test') {
    return `.env.test`;
  }
  if (process.env.NODE_ENV == 'development') {
    return `.env.development`;
  }
  return '.env';
}

export const getConfiguration = (): AppConfiguration => {
  const dbType = (process.env.DB_TYPE as AppDbType) || 'Mongo';

  return {
    DB_TYPE: dbType,
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
    sql: {
      DB_HOST: process.env.SQL_DB_HOST || '',
      DB_PORT: Number(process.env.SQL_DB_PORT) || 80,
      DB_NAME: process.env.SQL_DB_NAME || '',
      DB_USER: process.env.SQL_DB_USER || '',
      DB_PASS: process.env.SQL_DB_PASS || '',
    },
    gmail: {
      CLIENT_URL: process.env.MAIL_CLIENT_URL || '',
      EMAIL: process.env.MAIL_ADAPTER_USER || '',
      PASSWORD: process.env.MAIL_ADAPTER_PASS || '',
    },
  };
};
