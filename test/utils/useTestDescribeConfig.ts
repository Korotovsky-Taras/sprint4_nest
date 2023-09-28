import { INestApplication } from '@nestjs/common';
import { agent, SuperAgentTest } from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { useAppSettings } from '../../src/application/utils/useAppSettings';

export type AppTestProvider = {
  getApp(): INestApplication;
  getHttp(): SuperAgentTest;
};

//TODO возможно стоит иcпользовать MemoryDatabase
export function useTestDescribeConfig(): AppTestProvider {
  let app: INestApplication;
  let http: SuperAgentTest;
  // let mongoConnection?: Connection;
  // let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    useAppSettings(app);
    await app.init();
    // mongoServer = await MongoMemoryServer.create();
    // mongoConnection = (await connect(mongoServer.getUri())).connection;
    http = agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
    // if (mongoose.connection) {
    //   await mongoose.connection.dropDatabase();
    //   await mongoose.connection.close();
    // }
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
