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

type MakeKeyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type TypedDbKeys = MakeKeyOptional<TypedKeys<AppDbType>, 'SQLRaw'>;

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

export function getDbProviderKey(dbType: AppDbType): string {
  return 'DB_P' + dbType;
}

export const withTypedDbProvider = (map: TypedDbKeys) => {
  const configService = new ConfigService<AppConfiguration, true>();
  const dbType = configService.get<AppDbType>('DB_TYPE');

  let dbTypedClass = map[dbType];

  if (!dbTypedClass) {
    dbTypedClass = class FakeDbModule {};
  }

  return {
    provide: getDbProviderKey(dbType),
    useClass: dbTypedClass,
  };
};
