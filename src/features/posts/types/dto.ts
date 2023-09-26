import { PaginationQueryModel, WithPaginationQuery } from '../../../utils/types';
import { IPost } from './dao';
import { LikeStatus, WithExtendedLikes } from '../../likes/types';

export type PostCreateDto = Pick<IPost, 'title' | 'shortDescription' | 'content' | 'blogId' | 'blogName'>;

export type PostUpdateDto = Pick<IPost, 'title' | 'shortDescription' | 'content' | 'blogId'>;

export type PostViewDto = WithExtendedLikes<Pick<IPost, 'title' | 'shortDescription' | 'content' | 'blogId' | 'blogName'> & { id: string; createdAt: string }>;

export type PostCommentCreateDto = {
  content: string;
};

export type PostLikeStatusInputDto = {
  postId: string;
  userId: string;
  status: LikeStatus;
};

export type PostPaginationQueryDto = PaginationQueryModel<IPost>;

export type PostPaginationRepositoryDto = WithPaginationQuery<IPost>;
