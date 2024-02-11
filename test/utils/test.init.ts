import { INestApplication } from '@nestjs/common';
import { agent, SuperAgentTest } from 'supertest';
import { useAppSettings } from '../../src/application/utils/useAppSettings';
import { AuthTokenCreator } from '../../src/features/auth/utils/tokenCreator';
import { ITestingDaoUtils } from './dao/types';
import { testConfig } from './config/test.config';

export type AppTestProvider = {
  getApp(): INestApplication;
  getHttp(): SuperAgentTest;
  getDaoUtils(): ITestingDaoUtils;
  getTokenCreator(): AuthTokenCreator;
};

export function testInit(): AppTestProvider {
  let configApp: INestApplication;
  let configHttp: SuperAgentTest;
  let configDaoUtils: ITestingDaoUtils;
  let configTokenCreator: AuthTokenCreator;
  let configCloseConnections: () => Promise<void>;

  beforeAll(async () => {
    const { app, tokenCreator, daoUtils, closeConnections } = await testConfig();

    configApp = app;
    configDaoUtils = daoUtils;
    configTokenCreator = tokenCreator;
    configCloseConnections = closeConnections;

    useAppSettings(app);
    await app.init();
    configHttp = agent(app.getHttpServer());
  });

  afterAll((done) => {
    configCloseConnections()
      .then(() => {
        return configApp.close();
      })
      .finally(() => {
        done();
      });
  });

  return {
    getApp(): INestApplication {
      return configApp;
    },
    getHttp(): SuperAgentTest {
      return configHttp;
    },
    getDaoUtils(): ITestingDaoUtils {
      return configDaoUtils;
    },
    getTokenCreator(): AuthTokenCreator {
      return configTokenCreator;
    },
  };
}
