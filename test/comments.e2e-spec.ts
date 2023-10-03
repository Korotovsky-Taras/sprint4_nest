import { useTestDescribeConfig } from './utils/useTestDescribeConfig';
import { TestCreateUtils, validCommentData } from './utils/test.create.utils';
import { UserViewModel } from '../src/features/users/types/dto';
import { BlogViewModel } from '../src/features/blogs/types/dto';
import { PostViewModel } from '../src/features/posts/types/dto';
import { CommentViewModel } from '../src/features/comments/types/dto';
import { Status } from '../src/application/utils/types';
import { LikeStatus } from '../src/features/likes/types';

let blog: BlogViewModel | null = null;
let post: PostViewModel | null = null;
let user: UserViewModel | null = null;
let comment: CommentViewModel | null = null;

describe('comments testing', () => {
  const config = useTestDescribeConfig();
  const utils = new TestCreateUtils(config);

  beforeAll(async () => {
    await config.getModels().clearAll();

    user = await utils.createUser(utils.createNewUserModel());
    blog = await utils.createBlog(user.id);
    post = await utils.createPost(user.id, blog.id);
  });

  it('should not create comment', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();

    if (post && blog && user) {
      await config
        .getHttp()
        .post(`/posts/${post.id}/comments`)
        .set('Content-Type', 'application/json')
        .send({
          ...validCommentData,
        })
        .expect(Status.UNATHORIZED);

      const result = await config
        .getHttp()
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({})
        .expect(Status.BAD_REQUEST);

      expect(result.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'content',
          },
        ],
      });
    }
  });

  it('should create comment', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();

    if (post && blog && user) {
      comment = await utils.createComment(post.id, user.id);

      expect(comment).toEqual({
        id: expect.any(String),
        content: expect.any(String),
        commentatorInfo: { userId: user.id, userLogin: user.login },
        createdAt: expect.any(String),
        likesInfo: expect.any(Object),
      });
    }
  });

  it('should like comment', async () => {
    expect(user).not.toBeNull();
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(comment).not.toBeNull();

    if (user && post && blog && comment) {
      const res = await config
        .getHttp()
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });

      expect(res.status).toBe(Status.NO_CONTENT);

      const res2 = await config
        .getHttp()
        .get(`/comments/${comment.id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .expect(Status.OK);

      expect(res2.body).toEqual({
        id: expect.any(String),
        content: expect.any(String),
        commentatorInfo: expect.any(Object),
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatus.LIKE,
        },
      });
    }
  });

  it('should dislike comment', async () => {
    expect(user).not.toBeNull();
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(comment).not.toBeNull();

    if (user && post && blog && comment) {
      const res1 = await config
        .getHttp()
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.DISLIKE,
        });

      expect(res1.status).toBe(Status.NO_CONTENT);

      const res2 = await config
        .getHttp()
        .get(`/comments/${comment.id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .expect(Status.OK);

      expect(res2.body).toEqual({
        id: expect.any(String),
        content: expect.any(String),
        commentatorInfo: expect.any(Object),
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 1,
          myStatus: LikeStatus.DISLIKE,
        },
      });
    }
  });

  it('should like comment other user', async () => {
    expect(user).not.toBeNull();
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(comment).not.toBeNull();

    if (user && post && blog && comment) {
      const newUser = await utils.createUser(utils.createNewUserModel());

      const res1 = await config
        .getHttp()
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(newUser.id))
        .set('Content-Type', 'application/json')
        .send({
          likeStatus: LikeStatus.LIKE,
        });

      expect(res1.status).toBe(Status.NO_CONTENT);

      const res2 = await config
        .getHttp()
        .get(`/comments/${comment.id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + utils.createAccessToken(newUser.id))
        .expect(Status.OK);

      expect(res2.body).toEqual({
        id: expect.any(String),
        content: expect.any(String),
        commentatorInfo: expect.any(Object),
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 1,
          dislikesCount: 1,
          myStatus: LikeStatus.LIKE,
        },
      });
    }
  });

  it('should return validation error', async () => {
    expect(user).not.toBeNull();
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(comment).not.toBeNull();

    if (user && post && blog && comment) {
      const res1 = await config
        .getHttp()
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({});

      expect(res1.status).toBe(Status.BAD_REQUEST);
      expect(res1.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'likeStatus',
          },
        ],
      });

      const res2 = await config
        .getHttp()
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({ likeStatus: 'some status' });

      expect(res2.status).toBe(Status.BAD_REQUEST);
      expect(res2.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'likeStatus',
          },
        ],
      });
    }
  });

  it('should update comment', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();
    expect(comment).not.toBeNull();

    if (comment && user) {
      const newContent = utils.generateString(20);
      await config
        .getHttp()
        .put(`/comments/${comment.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .set('Content-Type', 'application/json')
        .send({
          content: newContent,
        })
        .expect(Status.NO_CONTENT);

      const result = await config.getHttp().get(`/comments/${comment.id}`).set('Content-Type', 'application/json').expect(Status.OK);

      expect(result.body).toEqual({
        id: expect.any(String),
        content: newContent,
        commentatorInfo: expect.any(Object),
        createdAt: expect.any(String),
        likesInfo: expect.any(Object),
      });
    }
  });

  it('should return 403 if user not comment owner', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(comment).not.toBeNull();
    const newUser = await utils.createUser(utils.createNewUserModel());

    if (post && blog && newUser && comment) {
      await config
        .getHttp()
        .put(`/comments/${comment.id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + utils.createAccessToken(newUser.id))
        .send({
          content: utils.generateString(20),
        })
        .expect(Status.FORBIDDEN);
    }
  });

  it('DELETE/PUT should return 404 if :id from uri param not found', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();
    expect(comment).not.toBeNull();

    const fakeCommentId = '64b92eac872655d706c510f1';

    if (post && blog && user && comment) {
      await config
        .getHttp()
        .put(`/comments/${fakeCommentId}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .send({
          content: utils.generateString(20),
        })
        .expect(Status.NOT_FOUND);

      await config
        .getHttp()
        .delete(`/comments/${fakeCommentId}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .expect(Status.NOT_FOUND);
    }
  });

  it('should 400 if passed body is incorrect', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();
    expect(comment).not.toBeNull();

    if (post && blog && user && comment) {
      await config
        .getHttp()
        .put(`/comments/${comment.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .send({
          content: utils.generateString(6),
        })
        .expect(Status.BAD_REQUEST);

      await config
        .getHttp()
        .put(`/comments/${comment.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .send({
          content: utils.generateString(400),
        })
        .expect(Status.BAD_REQUEST);
    }
  });

  it('should delete comment', async () => {
    expect(blog).not.toBeNull();
    expect(post).not.toBeNull();
    expect(user).not.toBeNull();
    expect(comment).not.toBeNull();

    if (post && blog && user && comment) {
      await config
        .getHttp()
        .delete(`/comments/${comment.id}`)
        .set('Authorization', 'Bearer ' + utils.createAccessToken(user.id))
        .expect(Status.NO_CONTENT);

      await config.getHttp().get(`/comments/${comment.id}`).set('Content-Type', 'application/json').expect(Status.NOT_FOUND);
    }
  });
});
