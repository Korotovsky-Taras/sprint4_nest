import { UserIdReq, WithPagination } from '../../../application/utils/types';
import { CommentMongoType, IComment } from './dao';
import { IRepository, IService } from '../../types';
import { CommentLikeStatusInputDto, CommentPaginationRepositoryDto, CommentUpdateDto, CommentViewDto } from './dto';
import { PostCommentCreateDto } from '../../posts/types/dto';
import { Request } from 'express';
import { LikeStatusUpdateDto } from '../../likes/types';
import { ServiceResult } from '../../../application/errors/ServiceResult';

export type CommentMapperType<T> = (comment: CommentMongoType, userId: UserIdReq) => T;
export type CommentListMapperType<T> = (comment: CommentMongoType[], userId: UserIdReq) => T[];

export interface ICommentsService extends IService {
  updateCommentById(commentId: string, userId: UserIdReq, model: CommentUpdateDto): Promise<void>;
  deleteCommentById(commentId: string, userId: string | null): Promise<void>;
  createComment<T>(postId: string, userId: UserIdReq, model: PostCommentCreateDto, dto: CommentMapperType<T>): Promise<ServiceResult<T>>;
  updateLikeStatus(userId: UserIdReq, model: CommentLikeStatusInputDto): Promise<void>;
}

export interface ICommentsController {
  getComment(commentId: string, req: Request): Promise<CommentViewDto>;
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
    dto: CommentListMapperType<T>,
  ): Promise<WithPagination<T>>;
  isUserCommentOwner(commentId: string, userId: string): Promise<boolean>;
  getCommentById<T>(userId: UserIdReq, id: string, dto: CommentMapperType<T>): Promise<T | null>;
}
