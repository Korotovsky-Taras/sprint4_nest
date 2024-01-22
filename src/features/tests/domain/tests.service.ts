import { UserConfirmation } from '../../users/types/dao';
import { Inject } from '@nestjs/common';
import { BlogRepoKey, IBlogsRepository } from '../../blogs/types/common';
import { IPostsRepository, PostRepoKey } from '../../posts/types/common';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { AuthRepoKey, IAuthSessionRepository } from '../../auth/types/common';
import { CommentsRepoKey, ICommentsRepository } from '../../comments/types/common';
import { IQuizGameRepository, QuizGameRepoKey } from '../../quiz_game/types/common';

export class TestsService {
  constructor(
    @Inject(BlogRepoKey) private readonly blogsRepo: IBlogsRepository<any>,
    @Inject(PostRepoKey) private readonly postsRepo: IPostsRepository<any>,
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository<any>,
    @Inject(AuthRepoKey) private readonly authRepo: IAuthSessionRepository<any>,
    @Inject(CommentsRepoKey) private readonly commentsRepo: ICommentsRepository<any>,
    @Inject(QuizGameRepoKey) private readonly quizRepo: IQuizGameRepository<any>,
  ) {}

  async getUserAuthConfirmationByLogin(login: string): Promise<UserConfirmation | null> {
    const user = await this.usersRepo.getUserByLoginOrEmail(login, '');
    if (!user) {
      return null;
    }
    return user.authConfirmation;
  }

  async clearAll() {
    await this.authRepo.clear();
    await this.usersRepo.clear();
    await this.postsRepo.clear();
    await this.blogsRepo.clear();
    await this.commentsRepo.clear();
    await this.quizRepo.clear();
  }
}
