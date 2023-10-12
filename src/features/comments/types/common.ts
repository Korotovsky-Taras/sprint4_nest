import { UserIdReq, WithPagination } from '../../../application/utils/types';
import { CommentMongoType, IComment } from './dao';
import { IRepository, IService } from '../../types';
import { CommentCreateDto, CommentPaginationRepositoryDto, CommentViewModel } from './dto';
import { Request } from 'express';
import { LikeStatusUpdateDto } from '../../likes/types';
import { CommentUpdateDto } from '../dto/CommentUpdateDto';

export type CommentMapperType<T> = (comment: CommentMongoType, userId: UserIdReq) => T;
export type CommentListMapperType<T> = (comment: CommentMongoType[], userId: UserIdReq) => T[];

export interface ICommentsService extends IService {}

export interface ICommentsController {
  getComment(commentId: string, req: Request): Promise<CommentViewModel>;
  updateComment(commentId: string, input: CommentUpdateDto, req: Request): Promise<void>;
  updateCommentLikeStatus(commentId: string, input: LikeStatusUpdateDto, req: Request): Promise<void>;
}

export interface ICommentsRepository extends IRepository<IComment> {
  createComment(dto: CommentCreateDto): Promise<string>;
  updateCommentById(id: string, input: CommentUpdateDto): Promise<boolean>;
  deleteCommentById(id: string): Promise<boolean>;
  isCommentExist(id: string): Promise<boolean>;
  isUserCommentOwner(id: string, userId: string): Promise<boolean>;
}

export interface ICommentsQueryRepository {
  getComments<T>(
    userId: UserIdReq,
    filter: Partial<CommentMongoType>,
    query: CommentPaginationRepositoryDto,
    mapper: CommentListMapperType<T>,
  ): Promise<WithPagination<T>>;
  getCommentById<T>(userId: UserIdReq, id: string, mapper: CommentMapperType<T>): Promise<T | null>;
}
