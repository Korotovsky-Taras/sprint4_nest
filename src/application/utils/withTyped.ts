import { AppConfiguration, AppDbType } from './config';
import { ConfigService } from '@nestjs/config';

type DbTypedClass = {
  [key in AppDbType]?: any;
};

export const withDbTypedClass = (key: symbol, map: DbTypedClass) => {
  const configService = new ConfigService<AppConfiguration, true>();
  const dbType = configService.get<AppDbType>('DB_TYPE');

  const dbTypedClass = map[dbType];
  if (!dbTypedClass) {
    throw Error(`Injection: DB_TYPE required for ${key.toString()}`);
  }

  return {
    provide: key,
    useClass: dbTypedClass,
  };
};

export const withDbTypedModule = (map: DbTypedClass) => {
  const configService = new ConfigService<AppConfiguration, true>();
  const dbType = configService.get<AppDbType>('DB_TYPE');

  const dbTypedClass = map[dbType];
  if (!dbTypedClass) {
    throw Error(`Module injection: DB_TYPE required module for ${dbType}`);
  }

  return dbTypedClass;
};
