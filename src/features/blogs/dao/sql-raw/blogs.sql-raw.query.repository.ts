import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IBlogsQueryRepository } from '../../types/common';
import { WithPagination } from '../../../../application/utils/types';
import { BlogDBType } from '../../types/dao';
import { BlogPaginationQueryDto } from '../../dto/BlogPaginationQueryDto';
import { withSqlRawPagination } from '../../../../application/utils/withSqlRawPagination';
import { BlogsSqlRawDataMapper } from './blogs.sql-raw.dm';
import { BlogViewModel } from '../../types/dto';

@Injectable()
export class BlogsSqlRawQueryRepository implements IBlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getBlogs(query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewModel>> {
    const searchByTerm = query.searchNameTerm ? query.searchNameTerm : '';

    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlRawPagination<BlogDBType, BlogViewModel>(
      this.dataSource,
      `SELECT *, CAST(count(*) OVER() as INTEGER) as "totalCount" 
           FROM public."Blogs" as t WHERE t."name" ILIKE $3 
           ORDER BY "${query.sortBy}" ${sortByWithCollate} ${query.sortDirection} 
           LIMIT $1 OFFSET $2`,
      [`%${searchByTerm}%`],
      query,
      (items) => {
        return BlogsSqlRawDataMapper.toBlogsView(items);
      },
    );
  }

  async getBlogById(id: string): Promise<BlogViewModel | null> {
    const res = await this.dataSource.query<BlogDBType[]>(`SELECT *FROM public."Blogs" as b WHERE b."_id" = $1`, [id]);
    if (res.length > 0) {
      return BlogsSqlRawDataMapper.toBlogView(res[0]);
    }
    return null;
  }
}
