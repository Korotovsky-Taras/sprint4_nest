import { Module } from '@nestjs/common';
import { PostsQueryRepository } from './dao/posts.query.repository';
import { PostsDataMapper } from './api/posts.dm';
import { PostsRepository } from './dao/posts.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './dao/posts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
  ],
  providers: [PostsRepository, PostsQueryRepository, PostsDataMapper],
  exports: [PostsRepository, PostsQueryRepository, PostsDataMapper],
})
export class PostsCommonModule {}
