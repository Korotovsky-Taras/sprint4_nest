import { AppConfig } from './types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { AuthTokenCreator } from '../../../src/features/auth/utils/tokenCreator';
import { TestsService } from '../../../src/features/tests/domain/tests.service';
import { TestDaoUtils } from '../dao/test.dao.utils';
import { ConfigService } from '@nestjs/config';
import { AppDbType } from '../../../src/application/utils/config';
import { DBService } from '../../../src/db/types';
import { getDbProviderKey } from '../../../src/application/utils/withTyped';

export const testConfig = async (): Promise<AppConfig> => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  const configService = moduleRef.get<ConfigService>(ConfigService) as ConfigService;
  const tokenCreator = moduleRef.get<AuthTokenCreator>(AuthTokenCreator) as AuthTokenCreator;
  const testsService = moduleRef.get<TestsService>(TestsService) as TestsService;

  const daoUtils = new TestDaoUtils(testsService);

  return {
    app,
    daoUtils,
    tokenCreator,
    closeConnections: async (): Promise<void> => {
      const dbType = configService.get<AppDbType>('DB_TYPE');
      const dbService = moduleRef.get<DBService>(getDbProviderKey(dbType!)) as DBService;

      if (dbService) {
        await dbService.closeConnection();
      }
    },
  };
};
