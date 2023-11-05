import { AppConfig } from './types';

export const appConnectMongoose = async (): Promise<AppConfig> => {
  // const moduleRef: TestingModule = await Test.createTestingModule({
  //   imports: [AppModule],
  //   providers: [
  //     {
  //       provide: getModelToken(User.name),
  //       useValue: User,
  //     },
  //     {
  //       provide: getModelToken(Blog.name),
  //       useValue: Blog,
  //     },
  //     {
  //       provide: getModelToken(Post.name),
  //       useValue: Post,
  //     },
  //     {
  //       provide: getModelToken(Comment.name),
  //       useValue: Comment,
  //     },
  //     {
  //       provide: getModelToken(AuthSession.name),
  //       useValue: AuthSession,
  //     },
  //   ],
  // })
  //   .overrideModule(DbMongooseModule)
  //   .useModule(DbMongooseTestingModule)
  //   .compile();
  //
  // const app = moduleRef.createNestApplication();
  //
  // const tokenCreator = moduleRef.get<AuthTokenCreator>(AuthTokenCreator) as AuthTokenCreator;
  //
  // const userModel = moduleRef.get<IUserModel>(getModelToken(User.name));
  // const blogModel = moduleRef.get<IBlogModel>(getModelToken(Blog.name));
  // const postModel = moduleRef.get<IPostModel>(getModelToken(Post.name));
  // const commentModel = moduleRef.get<ICommentModel>(getModelToken(Comment.name));
  // const authModel = moduleRef.get<IAuthSessionModel>(getModelToken(AuthSession.name));
  //
  // const daoUtils = new MongooseDaoUtils(blogModel, postModel, commentModel, userModel, authModel);
  //
  // return {};
};
