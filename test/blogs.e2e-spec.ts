import { useTestDescribeConfig } from './utils/useTestDescribeConfig';

import { UserViewModel } from '../src/features/users/types/dto';
import { BlogViewModel } from '../src/features/blogs/types/dto';
import { PostViewModel } from '../src/features/posts/types/dto';
import { Status } from '../src/application/utils/types';
import { authBasic64, TestCreateUtils, validBlogData, validPostData } from './utils/test.create.utils';

let createdBlogId: string | null = null;
let createdPostId: string | null = null;
let user: UserViewModel | null = null;

describe('blogs testing', () => {
  const config = useTestDescribeConfig();
  const utils = new TestCreateUtils(config);

  beforeAll(async () => {
    await config.getModels().clearAll();

    createdBlogId = null;
    createdPostId = null;
    user = await utils.createUser(utils.createNewUserModel());
  });

  it('should return bad request', async () => {
    expect(user).not.toBeNull();

    if (user) {
      await config.getHttp().get('/blogs/1').expect(Status.UNHANDLED);
    }
  });

  it('should create blog', async () => {
    expect(user).not.toBeNull();

    if (user) {
      const result = await config
        .getHttp()
        .post('/blogs')
        .set('Authorization', 'Basic ' + authBasic64)
        .set('Content-Type', 'application/json')
        .send(validBlogData)
        .expect(Status.CREATED);

      const { id }: Pick<BlogViewModel, 'id'> = result.body;

      createdBlogId = id;

      expect(result.body).toEqual({
        id: expect.any(String),
        name: validBlogData.name,
        description: validBlogData.description,
        websiteUrl: validBlogData.websiteUrl,
        isMembership: expect.any(Boolean),
        createdAt: expect.any(String),
      });
    }
  });

  it('should require authorization', async () => {
    expect(user).not.toBeNull();
    expect(createdBlogId).not.toBeNull();

    await config.getHttp().post('/blogs').set('Content-Type', 'application/json').send({}).expect(Status.UNATHORIZED);

    await config.getHttp().delete(`/blogs/${createdBlogId}`).expect(Status.UNATHORIZED);

    await config.getHttp().put(`/blogs/${createdBlogId}`).set('Content-Type', 'application/json').send({}).expect(Status.UNATHORIZED);
  });

  it('should create post', async () => {
    expect(user).not.toBeNull();
    expect(createdBlogId).not.toBeNull();

    if (user) {
      const result = await config
        .getHttp()
        .post('/posts')
        .set('Authorization', 'Basic ' + authBasic64)
        .set('Content-Type', 'application/json')
        .send({
          ...validPostData,
          blogId: createdBlogId,
        })
        .expect(Status.CREATED);

      const { id }: Pick<PostViewModel, 'id'> = result.body;

      createdPostId = id;

      expect(result.body).toEqual({
        id: expect.any(String),
        blogName: expect.any(String),
        title: validPostData.title,
        shortDescription: validPostData.shortDescription,
        content: validPostData.content,
        blogId: createdBlogId,
        createdAt: expect.any(String),
        extendedLikesInfo: expect.any(Object),
      });
    }
  });

  it('should update post', async () => {
    expect(user).not.toBeNull();
    expect(createdBlogId).not.toBeNull();

    if (user) {
      const newTitle = 'new title';

      await config
        .getHttp()
        .put(`/posts/${createdPostId}`)
        .set('Authorization', 'Basic ' + authBasic64)
        .set('Content-Type', 'application/json')
        .send({
          title: newTitle,
          shortDescription: 'valid short description',
          content: 'valid content',
          blogId: createdBlogId,
        })
        .expect(Status.NO_CONTENT);

      const result = await config.getHttp().get(`/posts/${createdPostId}`).set('Content-Type', 'application/json').expect(Status.OK);

      expect(result.body).toEqual({
        id: expect.any(String),
        title: newTitle,
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogName: expect.any(String),
        blogId: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: expect.any(Object),
      });
    }
  });
});
