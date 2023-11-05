import { CommentCommentatorInfo, IComment } from './dao';
import { LikeStatus, WithLikes } from '../../likes/types';

export type CommentCreateRequestModel = Pick<IComment, 'postId' | 'content'> & Pick<CommentCommentatorInfo, 'userId' | 'userLogin'>;

export type CommentCreateInputModel = Pick<IComment, 'postId' | 'content' | 'commentatorInfo'>;

export type CommentCreateModel = Pick<IComment, 'postId' | 'content' | 'commentatorInfo'>;

export type CommentLikeStatusInputModel = {
  commentId: string;
  status: LikeStatus;
};

export type CommentViewModel = WithLikes<Pick<IComment, 'content' | 'commentatorInfo'> & { id: string; createdAt: string }>;
