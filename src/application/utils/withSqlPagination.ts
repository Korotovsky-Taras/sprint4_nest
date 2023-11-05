import { WithPagination, WithPaginationQuery } from './types';
import { DataSource } from 'typeorm';

type SqlQueryWithTotalCount<T> = T & { totalCount: number };

export const withSqlPagination = async <T, O>(
  dataSource: DataSource,
  sql: string,
  sqlParams: any[],
  q: WithPaginationQuery,
  mapper: (input: T[]) => O[],
): Promise<WithPagination<O>> => {
  const res = await dataSource.query<SqlQueryWithTotalCount<T>[]>(sql, [q.pageSize, Math.max(q.pageNumber - 1, 0) * q.pageSize, ...sqlParams]);

  const { totalCount } = res[0];

  if (!totalCount) {
    throw new Error('SqlPagination: totalCount should be defined');
  }

  return {
    pagesCount: Math.ceil(totalCount / q.pageSize),
    page: q.pageNumber,
    pageSize: q.pageSize,
    totalCount,
    items: mapper(res),
  };
};
