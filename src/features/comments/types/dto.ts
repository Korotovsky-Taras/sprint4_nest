import { CommentCommentatorInfo, IComment } from './dao';
import { PaginationQueryModel, WithPaginationQuery } from '../../../application/utils/types';
import { LikeStatus, WithLikes } from '../../likes/types';

export type CommentCreateRequestDto = Pick<IComment, 'postId' | 'content'> & Pick<CommentCommentatorInfo, 'userId' | 'userLogin'>;

export type CommentCreateInputDto = Pick<IComment, 'postId' | 'content' | 'commentatorInfo'>;

export type CommentCreateDto = Pick<IComment, 'postId' | 'content' | 'commentatorInfo'>;

export type CommentUpdateDto = Pick<IComment, 'content'>;

export type CommentLikeStatusInputModel = {
  commentId: string;
  status: LikeStatus;
};

export type CommentViewDto = WithLikes<Pick<IComment, 'content' | 'commentatorInfo'> & { id: string; createdAt: string }>;

export type CommentPaginationQueryDto = PaginationQueryModel<IComment>;

export type CommentPaginationRepositoryDto = WithPaginationQuery<IComment>;
