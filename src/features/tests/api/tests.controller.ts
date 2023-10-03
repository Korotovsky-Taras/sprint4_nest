import { Controller, Delete, HttpCode, Injectable } from '@nestjs/common';
import { Status } from '../../../application/utils/types';
import { BlogsRepository } from '../../blogs/dao/blogs.repository';
import { PostsRepository } from '../../posts/dao/posts.repository';
import { CommentsRepository } from '../../comments/dao/comments.repository';
import { UsersRepository } from '../../users/dao/users.repository';
import { AuthSessionRepository } from '../../auth/dao/auth.repository';

@Injectable()
@Controller('testing')
export class TestsController {
  constructor(
    private readonly blogsRepo: BlogsRepository,
    private readonly postsRepo: PostsRepository,
    private readonly usersRepo: UsersRepository,
    private readonly authSessionRepo: AuthSessionRepository,
    private readonly commentsRepo: CommentsRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(Status.NO_CONTENT)
  async deleteAll() {
    await this.blogsRepo.clear();
    await this.postsRepo.clear();
    await this.usersRepo.clear();
    await this.commentsRepo.clear();
    await this.authSessionRepo.clear();
  }
}