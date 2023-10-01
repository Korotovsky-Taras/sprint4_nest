import { INestApplication } from '@nestjs/common';
import { agent, SuperAgentTest } from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { useAppSettings } from '../../src/application/utils/useAppSettings';
import { DBService } from '../../src/db/DBService';

export type AppTestProvider = {
  getApp(): INestApplication;
  getHttp(): SuperAgentTest;
};

export function useTestDescribeConfig(): AppTestProvider {
  let app: INestApplication;
  let http: SuperAgentTest;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();

    const connection = moduleFixture.get<DBService>(DBService).getConnection();

    for (const key in connection.collections) {
      // TODO надо убедиться что здесь не будет запросов в продакшин базу
      await connection.collections[key].deleteMany({});
    }

    useAppSettings(app);
    await app.init();
    http = agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  return {
    getApp(): INestApplication {
      return app;
    },
    getHttp(): SuperAgentTest {
      return http;
    },
  };
}
