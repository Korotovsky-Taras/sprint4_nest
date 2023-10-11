import 'reflect-metadata';

import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './blogs.schema';
import { BlogQueryModel } from '../types/dto';
import { BlogListMapperType, BlogMapperType, IBlogsQueryRepository } from '../types/common';
import { BlogDocumentType, BlogMongoType, IBlog } from '../types/dao';
import { withModelPagination } from '../../../application/utils/withModelPagination';
import { WithPagination } from '../../../application/utils/types';

@Injectable()
export class BlogsQueryRepository implements IBlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocumentType>) {}

  async getBlogs<T>(query: BlogQueryModel, mapper: BlogListMapperType<T>): Promise<WithPagination<T>> {
    const filter: FilterQuery<IBlog> = {};
    if (query.searchNameTerm != null) {
      filter.name = { $regex: query.searchNameTerm, $options: 'i' };
    }
    return withModelPagination<BlogMongoType, T>(this.blogModel, filter, query, mapper);
  }

  async getBlogById<T>(id: string, mapper: BlogMapperType<T>): Promise<T | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const blog: BlogMongoType | null = await this.blogModel.findById(id).lean();
    if (blog) {
      return mapper(blog);
    }
    return null;
  }
}
