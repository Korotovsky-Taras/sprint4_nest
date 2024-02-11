import { ServerApiVersion } from 'mongodb';

export type AppDbType = 'SQLRaw' | 'SQLOrm' | 'Mongo';

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
  DB_SSL: boolean;
  DB_AUTOLOAD_ENTITIES: boolean;
  DB_SYNCHRONIZE: boolean;
};

export type AppConfigurationGmail = {
  CLIENT_URL: string;
  EMAIL: string;
  PASSWORD: string;
};

export type AppConfiguration = {
  DB_TYPE: AppDbType;
  DEV_MODE: boolean;
  PORT: number;
  auth: AppConfigurationAuth;
  mongo: AppConfigurationMongo;
  sql: AppConfigurationSql;
  gmail: AppConfigurationGmail;
};

function isTrue(str: string | undefined): boolean {
  if (str === 'true') {
    return true;
  }
  return false;
}

export function getEnvFilePath() {
  if (process.env.NODE_ENV == 'test') {
    return `.env.test`;
  }
  if (process.env.NODE_ENV == 'development') {
    return `.env.development`;
  }
  return '.env';
}

function getSqlDbConfig(dbType: AppDbType) {
  switch (dbType) {
    case 'SQLOrm':
      return {
        DB_HOST: process.env.SQL_ORM_DB_HOST || '',
        DB_PORT: Number(process.env.SQL_ORM_DB_PORT) || 5432,
        DB_NAME: process.env.SQL_ORM_DB_NAME || '',
        DB_USER: process.env.SQL_ORM_DB_USER || '',
        DB_PASS: process.env.SQL_ORM_DB_PASS || '',
        DB_SSL: isTrue(process.env.SQL_ORM_DB_SSL) || true,
        DB_AUTOLOAD_ENTITIES: isTrue(process.env.SQL_ORM_DB_AUTOLOAD_ENTITIES) || true,
        DB_SYNCHRONIZE: isTrue(process.env.SQL_ORM_DB_SYNCHRONIZE) || true,
      };
    case 'SQLRaw':
    default:
      return {
        DB_HOST: process.env.SQL_DB_HOST || '',
        DB_PORT: Number(process.env.SQL_DB_PORT) || 5432,
        DB_NAME: process.env.SQL_DB_NAME || '',
        DB_USER: process.env.SQL_DB_USER || '',
        DB_PASS: process.env.SQL_DB_PASS || '',
        DB_SSL: isTrue(process.env.SQL_DB_SSL) || false,
        DB_AUTOLOAD_ENTITIES: isTrue(process.env.SQL_DB_AUTOLOAD_ENTITIES) || false,
        DB_SYNCHRONIZE: isTrue(process.env.SQL_DB_SYNCHRONIZE) || false,
      };
  }
}

export const getConfiguration = (): AppConfiguration => {
  const dbType = (process.env.DB_TYPE as AppDbType) || 'Mongo';

  return {
    DB_TYPE: dbType,
    DEV_MODE: isTrue(process.env.DEV_MODE),
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
    sql: getSqlDbConfig(dbType),
    gmail: {
      CLIENT_URL: process.env.MAIL_CLIENT_URL || '',
      EMAIL: process.env.MAIL_ADAPTER_USER || '',
      PASSWORD: process.env.MAIL_ADAPTER_PASS || '',
    },
  };
};
