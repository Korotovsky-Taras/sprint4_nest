import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserDeviceMiddleware } from './middlewares/user-device.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsModule } from './features/blogs/blogs.module';
import { PostsModule } from './features/posts/posts.module';
import { UsersModule } from './features/users/users.module';
import { CommentsModule } from './features/comments/comments.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [DbModule, BlogsModule, PostsModule, CommentsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserDeviceMiddleware).forRoutes('*');
  }
}
