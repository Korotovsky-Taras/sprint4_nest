import { IPost } from './dao';
import { LikeStatus, WithExtendedLikes } from '../../likes/types';
import { PaginationQueryModel, WithPaginationQuery } from '../../../application/utils/types';

export type PostCreateModel = Pick<IPost, 'title' | 'shortDescription' | 'content' | 'blogId' | 'blogName'>;

export type PostUpdateModel = Pick<IPost, 'title' | 'shortDescription' | 'content' | 'blogId'>;

export type PostViewDto = WithExtendedLikes<Pick<IPost, 'title' | 'shortDescription' | 'content' | 'blogId' | 'blogName'> & { id: string; createdAt: string }>;

export type PostLikeStatusInputModel = {
  postId: string;
  userId: string;
  status: LikeStatus;
};

export type PostPaginationQueryDto = PaginationQueryModel<IPost>;

export type PostPaginationRepositoryDto = WithPaginationQuery<IPost>;
