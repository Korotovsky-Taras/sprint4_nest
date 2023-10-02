import { UserIdReq, WithPagination } from '../../../application/utils/types';
import { CommentMongoType, IComment } from './dao';
import { IRepository, IService } from '../../types';
import { CommentLikeStatusInputModel, CommentPaginationRepositoryDto, CommentViewModel } from './dto';
import { Request } from 'express';
import { LikeStatusUpdateDto } from '../../likes/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { PostCommentCreateDto } from '../../posts/dto/PostCommentCreateDto';
import { CommentUpdateDto } from '../dto/CommentUpdateDto';

export type CommentMapperType<T> = (comment: CommentMongoType, userId: UserIdReq) => T;
export type CommentListMapperType<T> = (comment: CommentMongoType[], userId: UserIdReq) => T[];

export interface ICommentsService extends IService {
  updateCommentById(commentId: string, userId: UserIdReq, dto: CommentUpdateDto): Promise<ServiceResult>;
  deleteCommentById(commentId: string, userId: string | null): Promise<ServiceResult>;
  createComment<T>(postId: string, userId: UserIdReq, model: PostCommentCreateDto, mapper: CommentMapperType<T>): Promise<ServiceResult<T>>;
  updateLikeStatus(userId: UserIdReq, model: CommentLikeStatusInputModel): Promise<ServiceResult>;
}

export interface ICommentsController {
  getComment(commentId: string, req: Request): Promise<CommentViewModel>;
  updateComment(commentId: string, input: CommentUpdateDto, req: Request): Promise<void>;
  updateCommentLikeStatus(commentId: string, input: LikeStatusUpdateDto, req: Request): Promise<void>;
}

export interface ICommentsRepository extends IRepository<IComment> {
  updateCommentById(id: string, input: CommentUpdateDto): Promise<boolean>;
  deleteCommentById(id: string): Promise<boolean>;
}

export interface ICommentsQueryRepository {
  getComments<T>(
    userId: UserIdReq,
    filter: Partial<CommentMongoType>,
    query: CommentPaginationRepositoryDto,
    mapper: CommentListMapperType<T>,
  ): Promise<WithPagination<T>>;
  isUserCommentOwner(commentId: string, userId: string): Promise<boolean>;
  getCommentById<T>(userId: UserIdReq, id: string, mapper: CommentMapperType<T>): Promise<T | null>;
}
