import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './api/comments.controller';
import { PostsModule } from '../posts/posts.module';
import { CommentsService } from './domain/comments.service';
import { CommentsRepository } from './dao/comments.repository';
import { CommentsQueryRepository } from './dao/comments.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentsSchema } from './dao/comments.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
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
  providers: [CommentsService, CommentsRepository, CommentsQueryRepository],
  exports: [CommentsService, CommentsRepository, CommentsQueryRepository],
})
export class CommentsModule {}
