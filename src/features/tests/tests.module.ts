import { Module } from '@nestjs/common';
import { BlogsRepository } from '../blogs/dao/blogs.repository';
import { PostsRepository } from '../posts/dao/posts.repository';
import { CommentsRepository } from '../comments/dao/comments.repository';
import { UsersRepository } from '../users/dao/users.repository';
import { TestsController } from './api/tests.controller';

@Module({
  imports: [BlogsRepository, PostsRepository, UsersRepository, CommentsRepository],
  controllers: [TestsController],
})
export class TestsModule {}
