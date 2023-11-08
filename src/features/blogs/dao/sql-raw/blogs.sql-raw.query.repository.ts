import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogListMapperType, BlogMapperType, IBlogsQueryRepository } from '../../types/common';
import { WithPagination } from '../../../../application/utils/types';
import { BlogDBType } from '../../types/dao';
import { BlogPaginationQueryDto } from '../../dto/BlogPaginationQueryDto';
import { withSqlPagination } from '../../../../application/utils/withSqlPagination';

@Injectable()
export class BlogsSqlRawQueryRepository implements IBlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getBlogs<T>(query: BlogPaginationQueryDto, mapper: BlogListMapperType<T>): Promise<WithPagination<T>> {
    const searchByTerm = query.searchNameTerm ? query.searchNameTerm : '';

    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlPagination(
      this.dataSource,
      `SELECT *, CAST(count(*) OVER() as INTEGER) as "totalCount" 
           FROM public."Blogs" as t WHERE t."name" ILIKE $3 
           ORDER BY "${query.sortBy}" ${sortByWithCollate} ${query.sortDirection} 
           LIMIT $1 OFFSET $2`,
      [`%${searchByTerm}%`],
      query,
      mapper,
    );
  }

  async getBlogById<T>(id: string, mapper: BlogMapperType<T>): Promise<T | null> {
    const res = await this.dataSource.query<BlogDBType[]>(`SELECT *FROM public."Blogs" as b WHERE b."_id" = $1`, [id]);
    if (res.length > 0) {
      return mapper(res[0]);
    }
    return null;
  }
}
