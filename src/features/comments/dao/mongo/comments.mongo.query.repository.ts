import { Injectable } from '@nestjs/common';
import { ICommentsQueryRepository } from '../../types/common';
import { CommentMongoType, ICommentModel } from '../../types/dao';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comments.schema';
import { UserIdReq, WithPagination } from '../../../../application/utils/types';
import { withMongoPagination } from '../../../../application/utils/withMongoPagination';
import { ObjectId } from 'mongodb';
import { CommentsPaginationQueryDto } from '../../dto/CommentsPaginationQueryDto';
import { CommentViewModel } from '../../types/dto';
import { CommentsMongoDataMapper } from './comments.mongo.dm';

@Injectable()
export class CommentsMongoQueryRepository implements ICommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private commentModel: ICommentModel) {}

  async getComments(userId: UserIdReq, postId: string, query: CommentsPaginationQueryDto): Promise<WithPagination<CommentViewModel>> {
    return withMongoPagination<CommentMongoType, CommentViewModel>(this.commentModel, { postId }, query, (items) => {
      return CommentsMongoDataMapper.toCommentsView(items, userId);
    });
  }

  async getCommentById(userId: UserIdReq, id: string): Promise<CommentViewModel | null> {
    const comment: CommentMongoType | null = await this.commentModel.findOne({ _id: new ObjectId(id) }).lean();
    if (comment) {
      return CommentsMongoDataMapper.toCommentView(comment, userId);
    }
    return null;
  }
}
