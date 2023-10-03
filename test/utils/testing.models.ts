import { IBlogModel } from '../../src/features/blogs/types/dao';
import { IPostModel } from '../../src/features/posts/types/dao';
import { ICommentModel } from '../../src/features/comments/types/dao';
import { IUserModel } from '../../src/features/users/types/dao';
import { IAuthSessionModel } from '../../src/features/auth/types/dao';

export interface AbstractTestingModels {
  getBlogModel(): IBlogModel;
  getPostModel(): IPostModel;
  getCommentModel(): ICommentModel;
  getUserModel(): IUserModel;
  getAuthModel(): IAuthSessionModel;
}

export class TestingModels implements AbstractTestingModels {
  constructor(
    private blogModel: IBlogModel,
    private postModel: IPostModel,
    private commentModel: ICommentModel,
    private userModel: IUserModel,
    private authModel: IAuthSessionModel,
  ) {}

  getAuthModel(): IAuthSessionModel {
    return this.authModel;
  }

  getBlogModel(): IBlogModel {
    return this.blogModel;
  }

  getCommentModel(): ICommentModel {
    return this.commentModel;
  }

  getPostModel(): IPostModel {
    return this.postModel;
  }

  getUserModel(): IUserModel {
    return this.userModel;
  }

  async clearAll() {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.authModel.deleteMany({});
    await this.userModel.deleteMany({});
  }
}
