import { INestApplication } from '@nestjs/common';
import { agent, SuperAgentTest } from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

export type AppConsumer = {
  getApp(): INestApplication;
  getHttp(): SuperAgentTest;
};

export function appDescribe(fn: (appConsumer: AppConsumer) => void) {
  return describe('App (e2e)', () => {
    let app: INestApplication;
    let http: SuperAgentTest;
    // let mongoConnection?: Connection;
    // let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
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

    describe('init', () => {
      fn({
        getApp: () => {
          return app;
        },
        getHttp: () => {
          return http;
        },
      });
    });
  });
}
