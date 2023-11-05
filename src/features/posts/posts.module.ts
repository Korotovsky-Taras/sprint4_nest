import { forwardRef, Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { PostsService } from './domain/posts.service';
import { PostsMongoRepository } from './dao/mongo/posts.mongo.repository';
import { PostsMongoQueryRepository } from './dao/mongo/posts.mongo.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './dao/mongo/posts.schema';
import { CommentsModule } from '../comments/comments.module';
import { BlogsModule } from '../blogs/blogs.module';
import { IsPostIdExistValidator } from '../../application/decorators/validation/IsPostExist';
import { UsersModule } from '../users/users.module';
import { CqrsModule } from '@nestjs/cqrs';
import { postCases } from './use-cases';
import { withDbTypedClass } from '../../application/utils/withTypedClass';
import { PostQueryRepoKey, PostRepoKey } from './types/common';
import { PostsSqlRawRepository } from './dao/sql-raw/posts.sql-raw.repository';
import { PostsSqlRawQueryRepository } from './dao/sql-raw/posts.sql-raw.query.repository';

const PostQueryRepoTyped = withDbTypedClass(PostQueryRepoKey, { Mongo: PostsMongoQueryRepository, SQLRaw: PostsSqlRawQueryRepository });
const PostRepoTyped = withDbTypedClass(PostRepoKey, { Mongo: PostsMongoRepository, SQLRaw: PostsSqlRawRepository });

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
  providers: [PostsService, PostRepoTyped, PostQueryRepoTyped, IsPostIdExistValidator, ...postCases],
  exports: [PostRepoTyped, PostQueryRepoTyped],
})
export class PostsModule {}
