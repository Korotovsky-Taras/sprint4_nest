import setCookie from 'set-cookie-parser';
import { UUID } from 'crypto';
import { BlogCreateDto, BlogViewDto } from '../src/features/blogs/types/dto';
import { PostCommentCreateDto, PostCreateDto, PostViewDto } from '../src/features/posts/types/dto';
import { UserCreateRequestDto, UserViewDto } from '../src/features/users/types/dto';
import { CommentCreateRequestDto, CommentViewDto } from '../src/features/comments/types/dto';
import { Response, SuperAgentTest } from 'supertest';
import { AuthRefreshTokenPayload } from '../src/features/auth/utils/tokenCreator.types';
import { AuthTokenCreator } from '../src/features/auth/utils/tokenCreator';

export const authBasic64 = Buffer.from('admin:qwerty').toString('base64');

export type BlogCreationTestModel = BlogCreateDto;
export type PostCreationTestModel = Omit<PostCreateDto, 'blogId' | 'blogName'>;
export type CommentCreationTestModel = PostCommentCreateDto;
export type UserCreationTestModel = UserCreateRequestDto;

const authTokenCreator = new AuthTokenCreator();

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

export type Cookie = {
  value: string;
};

export type SessionUnit = {
  uuid: UUID;
  payload: AuthRefreshTokenPayload;
  refreshToken: string;
};

export function refreshCookie(cookie: Cookie | undefined, session: SessionUnit) {
  if (!cookie || !cookie.value) {
    throw Error('Refresh cookie error');
  }
  const payload: AuthRefreshTokenPayload | null = authTokenCreator.verifyRefreshToken(cookie.value);
  if (payload) {
    session.payload = payload;
    session.refreshToken = cookie.value;
  }
}

export function generateString(length = 20): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let string: string = '';
  for (let i = 0; i < length; i++) {
    string += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return string;
}

export function generateCredentials(loginLength = 8, passwordLength = 8): { login: string; password: string } {
  // Generate random login and password
  return { login: generateString(loginLength), password: generateString(passwordLength) };
}

export const createNewUserModel = (): UserCreationTestModel => {
  const { login, password } = generateCredentials();
  return {
    email: `${login}@gmail.com`,
    login,
    password,
  };
};

export const createBlog = async (http: SuperAgentTest, userId: string, model: BlogCreationTestModel = validBlogData): Promise<BlogViewDto> => {
  const result = await http
    .post('/blogs')
    .set('Authorization', 'Basic ' + authBasic64)
    .set('Content-Type', 'application/json')
    .send(model);
  return result.body;
};

export const createPost = async (http: SuperAgentTest, userId: string, blogId: string, model: PostCreationTestModel = validPostData): Promise<PostViewDto> => {
  const result = await http
    .post('/posts')
    .set('Authorization', 'Basic ' + authBasic64)
    .set('Content-Type', 'application/json')
    .send({
      ...model,
      blogId,
    } as PostCreateDto);
  return result.body;
};

export const createUser = async (http: SuperAgentTest, model: UserCreateRequestDto): Promise<UserViewDto> => {
  const result = await http
    .post('/users')
    .set('Authorization', 'Basic ' + authBasic64)
    .set('Content-Type', 'application/json')
    .send({
      ...model,
    } as UserCreateRequestDto);
  return result.body;
};

export const extractCookie = (res: Response, name: string): Cookie | undefined => {
  const decodedCookies = setCookie.parse(res.headers['set-cookie'], {
    decodeValues: true, // default: true
  });
  return decodedCookies.find((cookie) => cookie.name === name);
};

export const createCookie = (cookieObj: Object): string => {
  return Object.entries(cookieObj)
    .map(([name, value]) => {
      return name + '=' + value;
    })
    .join(';');
};

export const wait = async (s: number): Promise<void> => {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, s * 1000);
  });
};

export const createComment = async (
  http: SuperAgentTest,
  postId: string,
  userId: string,
  model: CommentCreationTestModel = validCommentData,
): Promise<CommentViewDto> => {
  const result = await http
    .post(`/posts/${postId}/comments`)
    .set('Authorization', 'Bearer ' + authTokenCreator.createAccessToken(userId).token)
    .set('Content-Type', 'application/json')
    .send({
      ...model,
    } as CommentCreateRequestDto);
  return result.body;
};
