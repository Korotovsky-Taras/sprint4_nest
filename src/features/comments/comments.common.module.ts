import { Module } from '@nestjs/common';
import { CommentsService } from './domain/comments.service';
import { CommentsQueryRepository } from './dao/comments.query.repository';
import { CommentsDataMapper } from './api/comments.dm';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentsSchema } from './dao/comments.schema';
import { CommentsRepository } from './dao/comments.repository';
import { UsersCommonModule } from '../users/users.common.module';
import { PostsCommonModule } from '../posts/posts.common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentsSchema,
      },
    ]),
    PostsCommonModule,
    UsersCommonModule,
  ],
  providers: [CommentsService, CommentsRepository, CommentsQueryRepository, CommentsDataMapper],
  exports: [CommentsService, CommentsRepository, CommentsQueryRepository, CommentsDataMapper],
})
export class CommentsCommonModule {}
