import { useTestDescribeConfig } from './utils/useTestDescribeConfig';
import { TestCreateUtils } from './utils/test.create.utils';
import { BlogViewModel } from '../src/features/blogs/types/dto';
import { PostViewModel } from '../src/features/posts/types/dto';
import { UserViewModel } from '../src/features/users/types/dto';
import { Status } from '../src/application/utils/types';
import { LikeStatus } from '../src/features/likes/types';
import { ObjectId } from 'mongodb';

let blog: BlogViewModel | null = null;
let post: PostViewModel | null = null;
let user: UserViewModel | null = null;

describe('posts testing', () => {
  const config = useTestDescribeConfig();
  const utils = new TestCreateUtils(config);

  beforeAll(async () => {
    await config.getModels().clearAll();

    user = await utils.createUser(utils.createNewUserModel());
    blog = await utils.createBlog(user.id);
    post = await utils.createPost(user.id, blog.id);
  });

  it('should add likes', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();

    if (blog && post && user) {
      await config
        .getHttp()
        .put(`/posts/${post.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(Status.NO_CONTENT);

      const res = await config
        .getHttp()
        .get(`/posts/${post.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json');

      expect(res.body.extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: expect.any(Array),
      });
    }
  });

  it('should create comment', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();

    if (blog && post && user) {
      await config
        .getHttp()
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({
          content: utils.generateString(20),
        })
        .expect(Status.CREATED);
    }
  });

  it('should change like to dislike likes', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();

    if (blog && post && user) {
      await config
        .getHttp()
        .put(`/posts/${post.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.DISLIKE,
        });

      const res = await config
        .getHttp()
        .get(`/posts/${post.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json');

      expect(res.body.extendedLikesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 1,
        myStatus: 'Dislike',
        newestLikes: expect.any(Array),
      });
    }
  });

  it('should return correct extended likes', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();

    if (blog && post && user) {
      await config
        .getHttp()
        .put(`/posts/${post.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });

      const user1 = await utils.createUser(utils.createNewUserModel());
      await config
        .getHttp()
        .put(`/posts/${post.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });

      const user2 = await utils.createUser(utils.createNewUserModel());
      await config
        .getHttp()
        .put(`/posts/${post.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user2.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });

      const res1 = await config
        .getHttp()
        .get(`/posts/${post.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json');

      expect(res1.body.extendedLikesInfo.newestLikes).toHaveLength(3);

      await config
        .getHttp()
        .put(`/posts/${post.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user2.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.DISLIKE,
        });

      const res2 = await config
        .getHttp()
        .get(`/posts/${post.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json');

      expect(res2.body.extendedLikesInfo.newestLikes).toHaveLength(2);
    }
  });

  it('should return 1 like after 2 likes', async () => {
    expect(blog).not.toBeNull();

    if (blog) {
      const user1 = await utils.createUser(utils.createNewUserModel());
      const post1 = await utils.createPost(user1.id, blog.id);

      await config
        .getHttp()
        .put(`/posts/${post1.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });

      await config
        .getHttp()
        .put(`/posts/${post1.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });

      const res = await config
        .getHttp()
        .get(`/posts/${post1.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json');

      expect(res.body.extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: expect.any(Array),
      });
    }
  });

  it('should 400 if passed body is incorrect', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();

    if (blog && post && user) {
      await config
        .getHttp()
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({
          content: utils.generateString(6),
        })
        .expect(Status.BAD_REQUEST);

      await config
        .getHttp()
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({
          content: utils.generateString(400),
        })
        .expect(Status.BAD_REQUEST);
    }
  });

  it('should 401 user unathorized', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();

    if (blog && post) {
      await config
        .getHttp()
        .post(`/posts/${post.id}/comments`)
        .set('Content-Type', 'application/json')
        .send({
          content: utils.generateString(20),
        })
        .expect(Status.UNATHORIZED);
    }
  });

  it('should 404 if postId not exist', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();
    const fakePostId = new ObjectId().toString();

    if (blog && post && user) {
      await config
        .getHttp()
        .post(`/posts/${fakePostId}/comments`)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .send({
          content: utils.generateString(20),
        })
        .expect(Status.NOT_FOUND);
    }
  });

  it('should get post comments without authorization', async () => {
    expect(post).not.toBeNull();

    if (post) {
      await config.getHttp().get(`/posts/${post.id}/comments`).set('Content-Type', 'application/json').expect(Status.OK);
    }
  });
});
