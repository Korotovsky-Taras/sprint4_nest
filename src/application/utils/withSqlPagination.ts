import { WithPagination, WithPaginationQuery } from './types';
import { DataSource } from 'typeorm';

export const withSqlPagination = async <T, O>(
  dataSource: DataSource,
  sql: string,
  sqlParams: any[],
  q: WithPaginationQuery,
  mapper: (input: T[]) => O[],
): Promise<WithPagination<O>> => {
  const res = await dataSource.query<T[]>(sql, [q.pageSize, Math.max(q.pageNumber - 1, 0) * q.pageSize, ...sqlParams]);

  const totalCount = res.length;

  return {
    pagesCount: Math.ceil(totalCount / q.pageSize),
    page: q.pageNumber,
    pageSize: q.pageSize,
    totalCount,
    items: mapper(res),
  };
};
