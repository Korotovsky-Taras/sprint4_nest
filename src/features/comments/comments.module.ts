import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './api/comments.controller';
import { PostsModule } from '../posts/posts.module';
import { CommentsService } from './domain/comments.service';
import { CommentsMongoRepository } from './dao/mongo/comments.mongo.repository';
import { CommentsMongoQueryRepository } from './dao/mongo/comments.mongo.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentsSchema } from './dao/mongo/comments.schema';
import { UsersModule } from '../users/users.module';
import { commentsCases } from './use-cases';
import { CqrsModule } from '@nestjs/cqrs';
import { withDbTypedClass } from '../../application/utils/withTyped';
import { CommentsQueryRepoKey, CommentsRepoKey } from './types/common';
import { CommentsSqlRawQueryRepository } from './dao/sql-raw/comments.sql-raw.query.repository';
import { CommentsSqlRawRepository } from './dao/sql-raw/comments.sql-raw.repository';
import { CommentsSqlOrmQueryRepository } from './dao/sql-orm/comments.sql-orm.query.repository';
import { CommentsSqlOrmRepository } from './dao/sql-orm/comments.sql-orm.repository';

const CommentsQueryRepoTyped = withDbTypedClass(CommentsQueryRepoKey, {
  Mongo: CommentsMongoQueryRepository,
  SQLRaw: CommentsSqlRawQueryRepository,
  SQLOrm: CommentsSqlOrmQueryRepository,
});
const CommentsRepoTyped = withDbTypedClass(CommentsRepoKey, {
  Mongo: CommentsMongoRepository,
  SQLRaw: CommentsSqlRawRepository,
  SQLOrm: CommentsSqlOrmRepository,
});

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentsSchema,
      },
    ]),
    forwardRef(() => PostsModule),
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepoTyped, CommentsQueryRepoTyped, ...commentsCases],
  exports: [CommentsService, CommentsRepoTyped, CommentsQueryRepoTyped],
})
export class CommentsModule {}
