import { SortingDirection, WithPagination, WithPaginationQuery } from './types';
import { SelectQueryBuilder } from 'typeorm';

const sqlSortDirectionUpper = (dir: SortingDirection): 'ASC' | 'DESC' => {
  return dir === 'asc' ? 'ASC' : 'DESC';
};

export const withSqlOrmPagination = async <T, O>(
  queryBuilder: SelectQueryBuilder<any>,
  q: WithPaginationQuery,
  sortByWithCollate: string,
  mapper: (input: T[]) => O[],
): Promise<WithPagination<O>> => {
  const items = await queryBuilder
    .addSelect(`CAST(count(*) OVER() as INTEGER)`, 'totalCount')
    .orderBy(`"${q.sortBy}" ${sortByWithCollate}`, sqlSortDirectionUpper(q.sortDirection))
    .skip(Math.max(q.pageNumber - 1, 0) * q.pageSize)
    .take(q.pageSize)
    .getRawMany();

  let totalCount = 0;
  if (items.length > 0 && items[0].totalCount) {
    totalCount = items[0].totalCount;
  }

  return {
    pagesCount: Math.ceil(totalCount / q.pageSize),
    page: q.pageNumber,
    pageSize: q.pageSize,
    totalCount,
    items: mapper(items),
  };
};
