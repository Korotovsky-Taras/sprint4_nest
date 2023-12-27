import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { IBlogsQueryRepository } from '../../types/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogsEntity } from './blogs.entity';
import { Repository } from 'typeorm';
import { BlogPaginationQueryDto } from '../../dto/BlogPaginationQueryDto';
import { WithPagination } from '../../../../application/utils/types';
import { BlogViewModel } from '../../types/dto';
import { BlogsSqlOrmDataMapper } from './blogs.sql-orm.dm';
import { withSqlOrmPagination } from '../../../../application/utils/withSqlOrmPagination';

@Injectable()
export class BlogsSqlOrmQueryRepository implements IBlogsQueryRepository {
  constructor(@InjectRepository(BlogsEntity) private blogsRepo: Repository<BlogsEntity>) {}

  async getBlogs(query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewModel>> {
    const searchByTerm = query.searchNameTerm ?? '';

    const queryBuilder = this.blogsRepo
      .createQueryBuilder('b')
      .select('b.*')
      .where(`b.name ILIKE :name`, { name: `%${searchByTerm}%` });

    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlOrmPagination<BlogsEntity, BlogViewModel>(queryBuilder, query, sortByWithCollate, (items) => {
      return BlogsSqlOrmDataMapper.toBlogsView(items);
    });
  }

  async getBlogById(id: string): Promise<BlogViewModel | null> {
    const res: BlogsEntity | null = await this.blogsRepo.findOne({ where: { _id: Number(id) } });
    if (res !== null) {
      return BlogsSqlOrmDataMapper.toBlogView(res);
    }
    return null;
  }
}
