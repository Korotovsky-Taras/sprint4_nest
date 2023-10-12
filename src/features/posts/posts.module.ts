import { forwardRef, Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { PostsService } from './domain/posts.service';
import { PostsRepository } from './dao/posts.repository';
import { PostsQueryRepository } from './dao/posts.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './dao/posts.schema';
import { CommentsModule } from '../comments/comments.module';
import { BlogsModule } from '../blogs/blogs.module';
import { IsPostIdExistValidator } from '../../application/decorators/validation/IsPostExist';
import { UsersModule } from '../users/users.module';
import { CqrsModule } from '@nestjs/cqrs';
import { postCases } from './use-cases';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
    forwardRef(() => CommentsModule),
    forwardRef(() => BlogsModule),
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, PostsQueryRepository, IsPostIdExistValidator, ...postCases],
  exports: [PostsRepository, PostsQueryRepository],
})
export class PostsModule {}
