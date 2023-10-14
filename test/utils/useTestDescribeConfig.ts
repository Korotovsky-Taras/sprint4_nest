import { INestApplication } from '@nestjs/common';
import { agent, SuperAgentTest } from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { useAppSettings } from '../../src/application/utils/useAppSettings';
import { IUserModel } from '../../src/features/users/types/dao';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../src/features/users/dao/users.schema';
import { Blog } from '../../src/features/blogs/dao/blogs.schema';
import { Comment } from '../../src/features/comments/dao/comments.schema';
import { Post } from '../../src/features/posts/dao/posts.schema';
import { AuthSession } from '../../src/features/auth/dao/auth.schema';
import { IAuthSessionModel } from '../../src/features/auth/types/dao';
import { ICommentModel } from '../../src/features/comments/types/dao';
import { IBlogModel } from '../../src/features/blogs/types/dao';
import { TestingModels } from './testing.models';
import { IPostModel } from '../../src/features/posts/types/dao';
import { AuthTokenCreator } from '../../src/features/auth/utils/tokenCreator';
import { DbModule } from '../../src/db/db.module';
import { DbTestingModule } from '../../src/db/db-testing.module';

export type AppTestProvider = {
  getApp(): INestApplication;
  getHttp(): SuperAgentTest;
  getModels(): TestingModels;
  getTokenCreator(): AuthTokenCreator;
};

export function useTestDescribeConfig(): AppTestProvider {
  let app: INestApplication;
  let http: SuperAgentTest;
  let models: TestingModels;
  let tokenCreator: AuthTokenCreator;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: User,
        },
        {
          provide: getModelToken(Blog.name),
          useValue: Blog,
        },
        {
          provide: getModelToken(Post.name),
          useValue: Post,
        },
        {
          provide: getModelToken(Comment.name),
          useValue: Comment,
        },
        {
          provide: getModelToken(AuthSession.name),
          useValue: AuthSession,
        },
      ],
    })
      .overrideModule(DbModule)
      .useModule(DbTestingModule)
      .compile();

    app = moduleRef.createNestApplication();

    tokenCreator = moduleRef.get<AuthTokenCreator>(AuthTokenCreator) as AuthTokenCreator;

    const userModel = moduleRef.get<IUserModel>(getModelToken(User.name));
    const blogModel = moduleRef.get<IBlogModel>(getModelToken(Blog.name));
    const postModel = moduleRef.get<IPostModel>(getModelToken(Post.name));
    const commentModel = moduleRef.get<ICommentModel>(getModelToken(Comment.name));
    const authModel = moduleRef.get<IAuthSessionModel>(getModelToken(AuthSession.name));

    models = new TestingModels(blogModel, postModel, commentModel, userModel, authModel);

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
    getModels(): TestingModels {
      return models;
    },
    getTokenCreator(): AuthTokenCreator {
      return tokenCreator;
    },
  };
}
