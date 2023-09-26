import { IBlog } from './dao';
import { IPost } from '../../posts/types/dao';
import { EnhancedOmit, PaginationQueryModel, WithPaginationQuery } from '../../../utils/types';

export type BlogCreateDto = Pick<IBlog, 'name' | 'description' | 'websiteUrl'>;

export type BlogPostCreateDto = Pick<IPost, 'title' | 'shortDescription' | 'content'>;

export type BlogUpdateDto = Pick<IBlog, 'name' | 'description' | 'websiteUrl'>;

export type BlogViewDto = Pick<IBlog, 'name' | 'description' | 'websiteUrl' | 'isMembership'> & { id: string; createdAt: string };

export type BlogPaginationQueryDto = PaginationQueryModel<IBlog> & {
  searchNameTerm?: string;
};

export type BlogPaginationRepositoryDto = EnhancedOmit<WithPaginationQuery<IBlog>, 'searchNameTerm'> & {
  searchNameTerm: string | null;
};

export type BlogQueryDto = WithPaginationQuery<IBlog> & { searchNameTerm: string | null };
