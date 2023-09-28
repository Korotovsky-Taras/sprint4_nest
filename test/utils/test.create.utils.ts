import { AppTestProvider } from './useTestDescribeConfig';
import { UserCreateRequestDto, UserViewDto } from '../../src/features/users/types/dto';
import { AuthTokenCreator } from '../../src/features/auth/utils/tokenCreator';
import { CommentCreateRequestDto, CommentViewDto } from '../../src/features/comments/types/dto';
import { BlogCreateDto, BlogViewDto } from '../../src/features/blogs/types/dto';
import { PostCommentCreateDto, PostCreateDto, PostViewDto } from '../../src/features/posts/types/dto';
import { TestCommonUtils } from './test.common.utils';

export class TestCreateUtils extends TestCommonUtils {
  private config: AppTestProvider;
  private tokenCreator: AuthTokenCreator;

  constructor(config: AppTestProvider) {
    super();
    this.config = config;
    this.tokenCreator = new AuthTokenCreator();
  }

  async createBlog(userId: string, model: BlogCreationTestModel = validBlogData): Promise<BlogViewDto> {
    const result = await this.config
      .getHttp()
      .post('/blogs')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send(model);
    return result.body;
  }

  async createPost(userId: string, blogId: string, model: PostCreationTestModel = validPostData): Promise<PostViewDto> {
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

  async createUser(model: UserCreateRequestDto): Promise<UserViewDto> {
    const result = await this.config
      .getHttp()
      .post('/users')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        ...model,
      } as UserCreateRequestDto);
    return result.body;
  }

  async createComment(postId: string, userId: string, model: CommentCreationTestModel = validCommentData): Promise<CommentViewDto> {
    const result = await this.config
      .getHttp()
      .post(`/posts/${postId}/comments`)
      .set('Authorization', 'Bearer ' + this.tokenCreator.createAccessToken(userId).token)
      .set('Content-Type', 'application/json')
      .send({
        ...model,
      } as CommentCreateRequestDto);
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
}

export type BlogCreationTestModel = BlogCreateDto;
export type PostCreationTestModel = Omit<PostCreateDto, 'blogId' | 'blogName'>;
export type CommentCreationTestModel = PostCommentCreateDto;
export type UserCreationTestModel = UserCreateRequestDto;

export const validBlogData: BlogCreationTestModel = {
  name: 'Taras',
  description: 'valid',
  websiteUrl: 'https://app.by',
};

export const validPostData: PostCreationTestModel = {
  title: 'valid title',
  shortDescription: 'valid short description',
  content: 'valid content',
};

export const validUserData: UserCreationTestModel = {
  login: 'taras',
  email: 'taras@gmail.com',
  password: 'Q12345q',
};

export const validCommentData: CommentCreationTestModel = {
  content: 'valid content of comment by lorem ipsum',
};

export const authBasic64 = Buffer.from('admin:qwerty').toString('base64');
