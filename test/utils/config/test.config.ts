import { AppConfig } from './types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { AuthTokenCreator } from '../../../src/features/auth/utils/tokenCreator';
import { TestsService } from '../../../src/features/tests/domain/tests.service';
import { TestDaoUtils } from '../dao/test.dao.utils';
import { DbMongooseService } from '../../../src/db/db-mongoose.service';
import { DataSource } from 'typeorm';

export const testConfig = async (): Promise<AppConfig> => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  const mongoDbService = moduleRef.get<DbMongooseService>(DbMongooseService) as DbMongooseService;
  const dataSource = moduleRef.get<DataSource>(DataSource) as DataSource;
  const tokenCreator = moduleRef.get<AuthTokenCreator>(AuthTokenCreator) as AuthTokenCreator;
  const testsService = moduleRef.get<TestsService>(TestsService) as TestsService;

  const daoUtils = new TestDaoUtils(testsService);

  return {
    app,
    daoUtils,
    tokenCreator,
    closeConnections: async (): Promise<void> => {
      await mongoDbService.getConnection().close();
      await dataSource.destroy();
    },
  };
};
