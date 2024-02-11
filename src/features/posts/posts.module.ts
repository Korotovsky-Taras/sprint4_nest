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
import { withTypedDbModule, withTypedRepository } from '../../application/utils/withTyped';
import { PostQueryRepoKey, PostRepoKey } from './types/common';
import { PostsSqlRawRepository } from './dao/sql-raw/posts.sql-raw.repository';
import { PostsSqlRawQueryRepository } from './dao/sql-raw/posts.sql-raw.query.repository';
import { PostsSqlOrmRepository } from './dao/sql-orm/posts.sql-orm.repository';
import { PostsSqlOrmQueryRepository } from './dao/sql-orm/posts.sql-orm.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsEntity } from './dao/sql-orm/entities/posts.entity';
import { PostsLikesEntity } from './dao/sql-orm/entities/posts-likes.entity';

const PostQueryRepoTyped = withTypedRepository(PostQueryRepoKey, {
  Mongo: PostsMongoQueryRepository,
  SQLRaw: PostsSqlRawQueryRepository,
  SQLOrm: PostsSqlOrmQueryRepository,
});
const PostRepoTyped = withTypedRepository(PostRepoKey, { Mongo: PostsMongoRepository, SQLRaw: PostsSqlRawRepository, SQLOrm: PostsSqlOrmRepository });
const PostDbModuleTyped = withTypedDbModule({
  Mongo: MongooseModule.forFeature([
    {
      name: Post.name,
      schema: PostSchema,
    },
  ]),
  SQLOrm: TypeOrmModule.forFeature([PostsEntity, PostsLikesEntity]),
});

@Module({
  imports: [CqrsModule, PostDbModuleTyped, forwardRef(() => CommentsModule), forwardRef(() => BlogsModule), UsersModule],
  controllers: [PostsController],
  providers: [PostsService, PostRepoTyped, PostQueryRepoTyped, IsPostIdExistValidator, ...postCases],
  exports: [PostRepoTyped, PostQueryRepoTyped],
})
export class PostsModule {}
