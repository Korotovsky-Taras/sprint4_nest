import { appDescribe } from './utils/appDescribe';
import { authBasic64, createNewUserModel, createUser, validBlogData, validPostData } from './utils';
import { UserViewDto } from '../src/features/users/types/dto';
import { Status } from '../src/utils/types';
import { BlogViewDto } from '../src/features/blogs/types/dto';
import { PostCreateDto, PostViewDto } from '../src/features/posts/types/dto';

let createdBlogId: string | null = null;
let createdPostId: string | null = null;
let user: UserViewDto | null = null;

appDescribe((appConsumer) => {
  describe('blogs testing', () => {
    beforeAll(async () => {
      createdBlogId = null;
      createdPostId = null;
      user = await createUser(appConsumer.getHttp(), createNewUserModel());
      await appConsumer.getHttp().delete('/testing/all-data');
    });

    // it('should require authorization', async () => {
    //   await appConsumer.getHttp().post('/blogs').set('Content-Type', 'application/json').send({}).expect(Status.UNATHORIZED);
    //
    //   await appConsumer.getHttp().delete('/blogs/1').expect(Status.UNATHORIZED);
    //
    //   await appConsumer.getHttp().put('/blogs/1').set('Content-Type', 'application/json').send({}).expect(Status.UNATHORIZED);
    //
    //   await appConsumer.getHttp().post('/posts').set('Content-Type', 'application/json').send({}).expect(Status.UNATHORIZED);
    //
    //   await appConsumer.getHttp().delete('/posts/1').expect(Status.UNATHORIZED);
    //
    //   await appConsumer.getHttp().put('/posts/1').set('Content-Type', 'application/json').send({}).expect(Status.UNATHORIZED);
    // });

    // it('should return bad request', async () => {
    //   expect(user).not.toBeNull();
    //
    //   if (user) {
    //     await appConsumer
    //       .getHttp()
    //       .get('/blogs/1')
    //       .set('Authorization', 'Bearer ' + createAccessToken(user.id).token)
    //       .expect(Status.UNHANDLED);
    //   }
    // });

    it('should create blog', async () => {
      expect(user).not.toBeNull();

      if (user) {
        const result = await appConsumer
          .getHttp()
          .post('/blogs')
          .set('Authorization', 'Basic ' + authBasic64)
          .set('Content-Type', 'application/json')
          .send(validBlogData)
          .expect(Status.CREATED);

        const { id }: Pick<BlogViewDto, 'id'> = result.body;

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

    it('should create post', async () => {
      expect(user).not.toBeNull();
      expect(createdBlogId).not.toBeNull();

      if (user) {
        const result = await appConsumer
          .getHttp()
          .post('/posts')
          .set('Authorization', 'Basic ' + authBasic64)
          .set('Content-Type', 'application/json')
          .send({
            ...validPostData,
            blogId: createdBlogId,
          } as PostCreateDto)
          .expect(Status.CREATED);

        const { id }: Pick<PostViewDto, 'id'> = result.body;

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

        await appConsumer
          .getHttp()
          .put(`/posts/${createdPostId}`)
          .set('Authorization', 'Basic ' + authBasic64)
          .set('Content-Type', 'application/json')
          .send({
            title: newTitle,
            shortDescription: 'valid short description',
            content: 'valid content',
            blogId: createdBlogId,
          } as PostCreateDto)
          .expect(Status.NO_CONTENT);

        const result = await appConsumer.getHttp().get(`/posts/${createdPostId}`).set('Content-Type', 'application/json').expect(Status.OK);

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
});
