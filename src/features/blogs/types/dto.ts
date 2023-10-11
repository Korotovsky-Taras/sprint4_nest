import { IBlog } from './dao';
import { EnhancedOmit, PaginationQueryModel, WithPaginationQuery } from '../../../application/utils/types';

export type BlogViewModel = Pick<IBlog, 'name' | 'description' | 'websiteUrl' | 'isMembership'> & { id: string; createdAt: string };

export type BlogPaginationQueryModel = PaginationQueryModel<IBlog> & {
  searchNameTerm?: string;
};

export type BlogPaginationRepositoryModel = EnhancedOmit<WithPaginationQuery<IBlog>, 'searchNameTerm'> & {
  searchNameTerm: string | null;
};

export type BlogQueryModel = WithPaginationQuery<IBlog> & { searchNameTerm: string | null };
