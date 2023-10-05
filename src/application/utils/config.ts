import env from 'dotenv';

if (process.env.NODE_ENV != 'production') {
  env.config({ path: `.env.development` });
} else {
  env.config();
}

export const appConfig: AppConfig = {
  port: Number(process.env.PORT) || 80,
  authLogin: process.env.AUTH_LOGIN || 'admin',
  authPassword: process.env.AUTH_PASSWORD || 'admin',
  tokenSecret: process.env.TOKEN_SK || 'secret',
  mongoUrl: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
  gmailClientUrl: process.env.MAIL_CLIENT_URL || '',
  gmailAdapterUser: process.env.MAIL_ADAPTER_USER || '',
  gmailAdapterPass: process.env.MAIL_ADAPTER_PASS || '',
  dbName: process.env.NODE_ENV || 'production',
};

type AppConfig = {
  port: number;
  authLogin: string;
  authPassword: string;
  tokenSecret: string;
  mongoUrl: string;
  dbName: string;
  gmailClientUrl: string;
  gmailAdapterUser: string;
  gmailAdapterPass: string;
};
