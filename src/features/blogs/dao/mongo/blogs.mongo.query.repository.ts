import 'reflect-metadata';

import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './blogs.mongo.schema';
import { BlogQueryModel, BlogViewModel } from '../../types/dto';
import { IBlogsQueryRepository } from '../../types/common';
import { BlogDBType, BlogDocumentType, IBlog } from '../../types/dao';
import { withMongoPagination } from '../../../../application/utils/withMongoPagination';
import { WithPagination } from '../../../../application/utils/types';
import { BlogsMongoDataMapper } from './blogs.mongo.dm';

@Injectable()
export class BlogsMongoQueryRepository implements IBlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocumentType>) {}

  async getBlogs(query: BlogQueryModel): Promise<WithPagination<BlogViewModel>> {
    const filter: FilterQuery<IBlog> = {};
    if (query.searchNameTerm != null) {
      filter.name = { $regex: query.searchNameTerm, $options: 'i' };
    }
    return withMongoPagination<BlogDBType, BlogViewModel>(this.blogModel, filter, query, (items) => {
      return BlogsMongoDataMapper.toBlogsView(items);
    });
  }

  async getBlogById(id: string): Promise<BlogViewModel | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const blog: BlogDBType | null = await this.blogModel.findById(id).lean();
    if (blog) {
      return BlogsMongoDataMapper.toBlogView(blog);
    }
    return null;
  }
}
