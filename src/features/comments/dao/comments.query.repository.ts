import { Injectable } from '@nestjs/common';
import { CommentListMapperType, CommentMapperType, ICommentsQueryRepository } from '../types/common';
import { CommentDocumentType, CommentMongoType, ICommentModel } from '../types/dao';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comments.schema';
import { CommentPaginationRepositoryDto } from '../types/dto';
import { UserIdReq, WithPagination } from '../../../application/utils/types';
import { withModelPagination } from '../../../application/utils/withModelPagination';
import { ObjectId } from 'mongodb';

@Injectable()
export class CommentsQueryRepository implements ICommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private commentModel: ICommentModel) {}

  async getComments<T>(
    userId: UserIdReq,
    filter: Partial<CommentMongoType>,
    query: CommentPaginationRepositoryDto,
    mapper: CommentListMapperType<T>,
  ): Promise<WithPagination<T>> {
    return withModelPagination<CommentMongoType, T>(this.commentModel, filter, query, (items) => {
      return mapper(items, userId);
    });
  }
  async getCommentById<T>(userId: UserIdReq, id: string, mapper: CommentMapperType<T>): Promise<T | null> {
    const comment: CommentDocumentType | null = await this.commentModel.findOne({ _id: new ObjectId(id) }).exec();
    if (comment) {
      return mapper(comment, userId);
    }
    return null;
  }
}
