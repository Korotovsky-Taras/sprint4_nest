import { Injectable } from '@nestjs/common';
import { CommentListMapperType, CommentMapperType, ICommentsQueryRepository } from '../types/common';
import { CommentDocumentType, CommentMongoType, ICommentModel } from '../types/dao';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comments.schema';
import { CommentPaginationRepositoryDto } from '../types/dto';
import { UserIdReq, WithPagination } from '../../../utils/types';
import { withModelPagination } from '../../../utils/withModelPagination';
import { ObjectId } from 'mongodb';

@Injectable()
export class CommentsQueryRepository implements ICommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private commentModel: ICommentModel) {}

  async getComments<T>(
    userId: UserIdReq,
    filter: Partial<CommentMongoType>,
    query: CommentPaginationRepositoryDto,
    dto: CommentListMapperType<T>,
  ): Promise<WithPagination<T>> {
    return withModelPagination<CommentMongoType, T>(this.commentModel, filter, query, (items) => {
      return dto(items, userId);
    });
  }
  async isUserCommentOwner(commentId: string, userId: string): Promise<boolean> {
    const query = this.commentModel.where({ _id: new ObjectId(commentId) }).where({ 'commentatorInfo.userId': userId });
    const res: CommentMongoType | null = await query.findOne().lean();
    return !!res;
  }
  async getCommentById<T>(userId: UserIdReq, id: string, dto: CommentMapperType<T>): Promise<T | null> {
    const comment: CommentDocumentType | null = await this.commentModel.findOne({ _id: new ObjectId(id) }).exec();
    if (comment) {
      return dto(comment, userId);
    }
    return null;
  }
  async isCommentExist(id: string): Promise<boolean> {
    const comment: CommentDocumentType | null = await this.commentModel.findOne({ _id: new ObjectId(id) }).exec();
    return !!comment;
  }
}
