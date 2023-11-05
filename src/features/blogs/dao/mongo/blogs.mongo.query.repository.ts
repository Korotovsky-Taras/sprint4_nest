import 'reflect-metadata';

import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './blogs.mongo.schema';
import { BlogQueryModel } from '../../types/dto';
import { BlogListMapperType, BlogMapperType, IBlogsQueryRepository } from '../../types/common';
import { BlogDBType, BlogDocumentType, IBlog } from '../../types/dao';
import { withMongoPagination } from '../../../../application/utils/withMongoPagination';
import { WithPagination } from '../../../../application/utils/types';

@Injectable()
export class BlogsMongoQueryRepository implements IBlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocumentType>) {}

  async getBlogs<T>(query: BlogQueryModel, mapper: BlogListMapperType<T>): Promise<WithPagination<T>> {
    const filter: FilterQuery<IBlog> = {};
    if (query.searchNameTerm != null) {
      filter.name = { $regex: query.searchNameTerm, $options: 'i' };
    }
    return withMongoPagination<BlogDBType, T>(this.blogModel, filter, query, mapper);
  }

  async getBlogById<T>(id: string, mapper: BlogMapperType<T>): Promise<T | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const blog: BlogDBType | null = await this.blogModel.findById(id).lean();
    if (blog) {
      return mapper(blog);
    }
    return null;
  }
}
