import { FilterQuery, Model } from 'mongoose';
import { WithPagination, WithPaginationQuery } from './types';

export async function withModelPagination<T, O>(
  model: Model<T>,
  filter: FilterQuery<T>,
  query: WithPaginationQuery<T>,
  mapper: (input: T[]) => O[],
): Promise<WithPagination<O>> {
  const totalCount: number = (await model.countDocuments(filter)) as number;

  const items: Awaited<T[]> = await model
    .find(filter)
    .sort({ [query.sortBy]: query.sortDirection })
    .skip(Math.max(query.pageNumber - 1, 0) * query.pageSize)
    .limit(query.pageSize)
    .lean<T[]>();

  return {
    pagesCount: Math.ceil(totalCount / query.pageSize),
    page: query.pageNumber,
    pageSize: query.pageSize,
    totalCount,
    items: mapper(items),
  };
}
