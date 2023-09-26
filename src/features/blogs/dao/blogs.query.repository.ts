import 'reflect-metadata';

import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { withModelPagination } from '../../../utils/withModelPagination';
import { WithPagination } from '../../../utils/types';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './blogs.schema';
import { BlogQueryDto } from '../types/dto';
import { BlogListMapperType, BlogMapperType, IBlogsQueryRepository } from '../types/common';
import { BlogDocumentType, BlogMongoType, IBlog } from '../types/dao';

@Injectable()
export class BlogsQueryRepository implements IBlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocumentType>) {}

  async getBlogs<T>(query: BlogQueryDto, dto: BlogListMapperType<T>): Promise<WithPagination<T>> {
    const filter: FilterQuery<IBlog> = {};
    if (query.searchNameTerm != null) {
      filter.name = { $regex: query.searchNameTerm, $options: 'i' };
    }
    return withModelPagination<BlogMongoType, T>(this.blogModel, filter, query, dto);
  }

  async getBlogById<T>(id: string, dto: BlogMapperType<T>): Promise<T | null> {
    const blog: BlogMongoType | null = await this.blogModel.findById(id).lean();
    if (blog) {
      return dto(blog);
    }
    return null;
  }
}
