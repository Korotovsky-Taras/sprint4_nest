import { AppConfiguration, AppDbType } from './config';
import { ConfigService } from '@nestjs/config';

type TypedKeys<T extends string | number | symbol> = {
  [key in T]: any;
};

type TypedRepositoryKeys = TypedKeys<AppDbType>;

/**
 * Подключение зависимостей для репозитория
 */
export const withTypedRepository = (key: symbol, map: TypedRepositoryKeys) => {
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

type TypedDbKeys = TypedKeys<Exclude<AppDbType, 'SQLRaw'>>;

/**
 * Подключение зависимостей для модулей БД
 */
export const withTypedDbModule = (map: TypedDbKeys) => {
  const configService = new ConfigService<AppConfiguration, true>();
  const dbType = configService.get<AppDbType>('DB_TYPE');

  const dbTypedClass = map[dbType];

  if (!dbTypedClass) {
    return class FakeDbModule {};
  }

  return dbTypedClass;
};
