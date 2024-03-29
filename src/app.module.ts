import { configModule } from './app.configuration';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserDeviceMiddleware } from './middlewares/user-device.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsModule } from './features/blogs/blogs.module';
import { PostsModule } from './features/posts/posts.module';
import { UsersModule } from './features/users/users.module';
import { CommentsModule } from './features/comments/comments.module';
import { AuthModule } from './features/auth/auth.module';
import { SharedModule } from './shared.module';
import { TestsModule } from './features/tests/tests.module';
import { DbModule } from './db/db.module';
import { LogsModule } from './features/logs/logs.module';
import { QuizGameModule } from './features/quiz_game/quiz-game.module';
import { AppConfigService } from './app.config.service';

@Module({
  imports: [configModule, DbModule, SharedModule, BlogsModule, PostsModule, CommentsModule, UsersModule, AuthModule, QuizGameModule, TestsModule, LogsModule],
  controllers: [AppController],
  providers: [AppService, AppConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserDeviceMiddleware).forRoutes('*');
  }
}
