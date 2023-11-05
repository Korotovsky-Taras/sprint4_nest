import { IBlogModel } from '../../../src/features/blogs/types/dao';
import { IPostModel } from '../../../src/features/posts/types/dao';
import { ICommentModel } from '../../../src/features/comments/types/dao';
import { IUserModel, UserConfirmation } from '../../../src/features/users/types/dao';
import { IAuthSessionModel } from '../../../src/features/auth/types/dao';
import { ITestingDaoUtils } from '../dao/types';

export class MongooseDaoUtils implements ITestingDaoUtils {
  constructor(
    private blogModel: IBlogModel,
    private postModel: IPostModel,
    private commentModel: ICommentModel,
    private userModel: IUserModel,
    private authModel: IAuthSessionModel,
  ) {}

  async getUserAuthConfirmationByLogin(login: string): Promise<UserConfirmation | null> {
    const user = await this.userModel.findOne({ login }).exec();
    if (!user) {
      return null;
    }
    return user.authConfirmation;
  }

  async clearAll() {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.authModel.deleteMany({});
    await this.userModel.deleteMany({});
  }
}
