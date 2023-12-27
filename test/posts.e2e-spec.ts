import { testInit } from './utils/test.init';
import { authBasic64, TestCreateUtils } from './utils/test.create.utils';
import { BlogViewModel } from '../src/features/blogs/types/dto';
import { PostViewModel } from '../src/features/posts/types/dto';
import { UserViewModel } from '../src/features/users/types/dto';
import { LikeStatus } from '../src/features/likes/types';
import { Status } from '../src/application/utils/types';
import { randomUUID } from 'crypto';

let blog: BlogViewModel | null = null;
let post: PostViewModel | null = null;
let user: UserViewModel | null = null;

describe('posts testing', () => {
  const config = testInit();
  const utils = new TestCreateUtils(config);

  beforeAll(async () => {
    await config.getDaoUtils().clearAll();

    user = await utils.createUser(utils.createNewUserModel());
    blog = await utils.createBlog(user.id);
    post = await utils.createPost(user.id, blog.id);
  });

  it('should update post', async () => {
    expect(user).not.toBeNull();
    expect(blog).not.toBeNull();

    if (user && blog && post) {
      const newTitle = 'new title';

      await config
        .getHttp()
        .put(`/posts/${post.id}`)
        .set('Authorization', 'Basic ' + authBasic64)
        .set('Content-Type', 'application/json')
        .send({
          title: newTitle,
          shortDescription: 'valid short description',
          content: 'valid content',
          blogId: blog.id,
        })
        .expect(Status.NO_CONTENT);

      const result = await config.getHttp().get(`/posts/${post.id}`).set('Content-Type', 'application/json').expect(Status.OK);

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

  it('should return LIKE DISLIKE NONE status', async () => {
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

      const res1 = await config
        .getHttp()
        .get(`/posts/${post1.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json');

      expect(res1.body.extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: expect.any(Array),
      });

      await config
        .getHttp()
        .put(`/posts/${post1.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.DISLIKE,
        });

      const res2 = await config
        .getHttp()
        .get(`/posts/${post1.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json');

      expect(res2.body.extendedLikesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 1,
        myStatus: 'Dislike',
        newestLikes: expect.any(Array),
      });

      await config
        .getHttp()
        .put(`/posts/${post1.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.NONE,
        });

      const res3 = await config
        .getHttp()
        .get(`/posts/${post1.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json');

      expect(res3.body.extendedLikesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: expect.any(Array),
      });
    }
  });

  it('should return right status', async () => {
    expect(blog).not.toBeNull();

    if (blog) {
      const user1 = await utils.createUser(utils.createNewUserModel());
      const user2 = await utils.createUser(utils.createNewUserModel());
      const user3 = await utils.createUser(utils.createNewUserModel());
      const user4 = await utils.createUser(utils.createNewUserModel());

      const post1 = await utils.createPost(user1.id, blog.id);
      const post2 = await utils.createPost(user1.id, blog.id);
      const post3 = await utils.createPost(user1.id, blog.id);
      const post4 = await utils.createPost(user1.id, blog.id);
      const post5 = await utils.createPost(user1.id, blog.id);
      const post6 = await utils.createPost(user1.id, blog.id);

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
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user2.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });

      await config
        .getHttp()
        .put(`/posts/${post2.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user2.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });
      await config
        .getHttp()
        .put(`/posts/${post2.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user3.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });

      await config
        .getHttp()
        .put(`/posts/${post3.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.DISLIKE,
        });

      await config
        .getHttp()
        .put(`/posts/${post4.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });
      await config
        .getHttp()
        .put(`/posts/${post4.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user4.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });
      await config
        .getHttp()
        .put(`/posts/${post4.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user2.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });
      await config
        .getHttp()
        .put(`/posts/${post4.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user3.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });

      await config
        .getHttp()
        .put(`/posts/${post5.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user2.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });
      await config
        .getHttp()
        .put(`/posts/${post5.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user3.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.DISLIKE,
        });

      await config
        .getHttp()
        .put(`/posts/${post6.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });
      await config
        .getHttp()
        .put(`/posts/${post6.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user2.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.DISLIKE,
        });

      const res = await config
        .getHttp()
        .get(`/blogs/${blog.id}/posts`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user1.id))
        .set('Content-Type', 'application/json');

      let myStatusLike = 0;
      let myStatusDislike = 0;
      let myStatusNone = 0;
      res.body.items.forEach((item) => {
        if (item.extendedLikesInfo.myStatus === 'Like') {
          myStatusLike++;
        } else if (item.extendedLikesInfo.myStatus === 'Dislike') {
          myStatusDislike++;
        } else {
          myStatusNone++;
        }
      });

      expect(myStatusLike).toBe(3);
      expect(myStatusDislike).toBe(1);
      expect(myStatusNone).toBe(res.body.items.length - myStatusLike - myStatusDislike);
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
    const fakePostId = randomUUID();

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
