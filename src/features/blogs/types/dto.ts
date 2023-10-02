import { IBlog } from './dao';
import { EnhancedOmit, PaginationQueryModel, WithPaginationQuery } from '../../../application/utils/types';

export type BlogViewModel = Pick<IBlog, 'name' | 'description' | 'websiteUrl' | 'isMembership'> & { id: string; createdAt: string };

export type BlogPaginationQueryDto = PaginationQueryModel<IBlog> & {
  searchNameTerm?: string;
};

export type BlogPaginationRepositoryDto = EnhancedOmit<WithPaginationQuery<IBlog>, 'searchNameTerm'> & {
  searchNameTerm: string | null;
};

export type BlogQueryDto = WithPaginationQuery<IBlog> & { searchNameTerm: string | null };
