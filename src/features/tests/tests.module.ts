import { Module } from '@nestjs/common';
import { TestsController } from './api/tests.controller';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [BlogsModule, PostsModule, UsersModule, CommentsModule, AuthModule],
  controllers: [TestsController],
})
export class TestsModule {}
