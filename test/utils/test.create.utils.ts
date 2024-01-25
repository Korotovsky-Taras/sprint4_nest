import { AppTestProvider } from './test.init';
import { UserCreateModel, UserViewModel } from '../../src/features/users/types/dto';
import { CommentCreateRequestModel, CommentViewModel } from '../../src/features/comments/types/dto';
import { BlogViewModel } from '../../src/features/blogs/types/dto';
import { PostViewModel } from '../../src/features/posts/types/dto';
import { TestCommonUtils } from './test.common.utils';
import { BlogCreateDto } from '../../src/features/blogs/dto/BlogCreateDto';
import { PostCreateDto } from '../../src/features/posts/dto/PostCreateDto';
import { PostCommentCreateDto } from '../../src/features/posts/dto/PostCommentCreateDto';
import { QuizGameAnswerViewModel, QuizGameQuestionCreateModel, QuizGameViewModel } from '../../src/features/quiz_game/types/dto';

export class TestCreateUtils extends TestCommonUtils {
  private readonly config: AppTestProvider;

  constructor(config: AppTestProvider) {
    super();
    this.config = config;
  }

  async sendQuizAnswer(token: string, correct = true): Promise<{ answer: QuizGameAnswerViewModel; current: QuizGameViewModel }> {
    const answer = correct ? 'correct' : 'incorrect';
    const result = await this.config
      .getHttp()
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send({ answer });

    const result2 = await this.config
      .getHttp()
      .get(`/pair-game-quiz/pairs/my-current`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);

    return {
      answer: result.body,
      current: result2.body,
    };
  }

  async createBlog(userId: string, model: BlogCreationTestModel = validBlogData): Promise<BlogViewModel> {
    const result = await this.config
      .getHttp()
      .post('/sa/blogs')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send(model);
    return result.body;
  }

  async createPost(userId: string, blogId: string, model: PostCreationTestModel = validPostData): Promise<PostViewModel> {
    const result = await this.config
      .getHttp()
      .post('/posts')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        ...model,
        blogId,
      } as PostCreateDto);
    return result.body;
  }

  async createUser(model: UserCreateModel): Promise<UserViewModel> {
    const result = await this.config
      .getHttp()
      .post('/sa/users')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        ...model,
      } as UserCreateModel);
    return result.body;
  }

  async createComment(postId: string, userId: string, model: CommentCreationTestModel = validCommentData): Promise<CommentViewModel> {
    const result = await this.config
      .getHttp()
      .post(`/posts/${postId}/comments`)
      .set('Authorization', 'Bearer ' + this.createAccessToken(userId))
      .set('Content-Type', 'application/json')
      .send({
        ...model,
      } as CommentCreateRequestModel);
    return result.body;
  }

  createNewUserModel(): UserCreationTestModel {
    const { login, password } = this.generateCredentials();
    return {
      email: `${login}@gmail.com`,
      login,
      password,
    };
  }

  createNewQuestionModel(): QuizQuestionTestModel {
    const body = this.generateString(20);
    const getRandomCount = () => Math.max(1, Math.floor(10 * Math.random()));
    const correctAnswerPredicate = (_, i) => {
      if (i === 0) {
        return 'correct';
      }
      return this.generateString(getRandomCount());
    };
    return {
      body,
      correctAnswers: new Array(getRandomCount()).fill(0).map(correctAnswerPredicate),
    };
  }

  createAccessToken(userId: string): string {
    const tokenCreator = this.config.getTokenCreator();
    return tokenCreator.createAccessToken(userId).token;
  }
}

export type BlogCreationTestModel = BlogCreateDto;
export type PostCreationTestModel = Omit<PostCreateDto, 'blogId' | 'blogName'>;
export type CommentCreationTestModel = PostCommentCreateDto;
export type UserCreationTestModel = UserCreateModel;
export type QuizQuestionTestModel = Omit<QuizGameQuestionCreateModel, 'published' | 'correctAnswers'> & { correctAnswers: any[] };

export const validBlogData: BlogCreationTestModel = {
  name: 'Taras',
  description: 'valid',
  websiteUrl: 'https://app.by',
} as BlogCreationTestModel;

export const validPostData: PostCreationTestModel = {
  title: 'valid title',
  shortDescription: 'valid short description',
  content: 'valid content',
} as PostCreationTestModel;

export const validUserData: UserCreationTestModel = {
  login: 'taras',
  email: 'taras@gmail.com',
  password: 'Q12345q',
} as UserCreationTestModel;

export const validCommentData: CommentCreationTestModel = {
  content: 'valid content of comment by lorem ipsum',
} as CommentCreationTestModel;

export const authBasic64 = Buffer.from('admin:qwerty').toString('base64');
