import { UserIdReq, WithPagination } from '../../../application/utils/types';
import { IComment } from './dao';
import { IRepository, IService } from '../../types';
import { CommentCreateModel, CommentViewModel } from './dto';
import { Request } from 'express';
import { LikeStatus, LikeStatusUpdateDto } from '../../likes/types';
import { CommentUpdateDto } from '../dto/CommentUpdateDto';
import { CommentsPaginationQueryDto } from '../dto/CommentsPaginationQueryDto';

export interface ICommentsService extends IService {}

export interface ICommentsController {
  getComment(commentId: string, req: Request): Promise<CommentViewModel>;
  updateComment(commentId: string, input: CommentUpdateDto, req: Request): Promise<void>;
  updateCommentLikeStatus(commentId: string, input: LikeStatusUpdateDto, req: Request): Promise<void>;
}

export const CommentsRepoKey = Symbol('COMMENTS_REPO');

export interface ICommentsRepository extends IRepository<IComment> {
  createComment(dto: CommentCreateModel): Promise<string>;
  updateCommentById(commentId: string, input: CommentUpdateDto): Promise<boolean>;
  updateLike(commentId: string, userId: string, status: LikeStatus): Promise<boolean>;
  deleteCommentById(commentId: string): Promise<boolean>;
  isCommentExist(commentId: string): Promise<boolean>;
  isUserCommentOwner(commentId: string, userId: string): Promise<boolean>;
}

export const CommentsQueryRepoKey = Symbol('COMMENTS_QUERY_REPO');

export interface ICommentsQueryRepository {
  getComments(userId: UserIdReq, postId: string, query: CommentsPaginationQueryDto): Promise<WithPagination<CommentViewModel>>;
  getCommentById(userId: UserIdReq, commentId: string): Promise<CommentViewModel | null>;
}
