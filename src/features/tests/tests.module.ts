import { Module } from '@nestjs/common';
import { TestsController } from './api/tests.controller';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';
import { TestsService } from './domain/tests.service';
import { QuizGameModule } from '../quiz_game/quiz-game.module';

@Module({
  imports: [BlogsModule, PostsModule, UsersModule, CommentsModule, AuthModule, QuizGameModule],
  controllers: [TestsController],
  providers: [TestsService],
})
export class TestsModule {}
