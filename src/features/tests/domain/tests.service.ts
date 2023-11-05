import { UserConfirmation } from '../../users/types/dao';
import { Inject } from '@nestjs/common';
import { BlogRepoKey, IBlogsRepository } from '../../blogs/types/common';
import { IPostsRepository, PostRepoKey } from '../../posts/types/common';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { AuthRepoKey, IAuthSessionRepository } from '../../auth/types/common';
import { CommentsRepoKey, ICommentsRepository } from '../../comments/types/common';

export class TestsService {
  constructor(
    @Inject(BlogRepoKey) private readonly blogsRepo: IBlogsRepository,
    @Inject(PostRepoKey) private readonly postsRepo: IPostsRepository,
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository,
    @Inject(AuthRepoKey) private readonly authRepo: IAuthSessionRepository,
    @Inject(CommentsRepoKey) private readonly commentsRepo: ICommentsRepository,
  ) {}

  async getUserAuthConfirmationByLogin(login: string): Promise<UserConfirmation | null> {
    const user = await this.usersRepo.getUserByLoginOrEmail(login, '');
    if (!user) {
      return null;
    }
    return user.authConfirmation;
  }

  async clearAll() {
    await this.blogsRepo.clear();
    await this.postsRepo.clear();
    await this.usersRepo.clear();
    await this.commentsRepo.clear();
    await this.authRepo.clear();
  }
}