import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './blogs.schema';
import { BlogMapperType, IBlogsRepository } from '../types/common';
import { BlogDocumentType, IBlogModel } from '../types/dao';
import { BlogCreateDto } from '../dto/BlogCreateDto';
import { BlogUpdateDto } from '../dto/BlogUpdateDto';

@Injectable()
export class BlogsRepository implements IBlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: IBlogModel) {}

  async createBlog<T>(input: BlogCreateDto, mapper: BlogMapperType<T>): Promise<T> {
    const model: BlogDocumentType = this.blogModel.createBlog(input);
    await this.saveDoc(model);
    return mapper(model);
  }

  async updateBlogById(id: string, input: BlogUpdateDto): Promise<boolean> {
    const res: UpdateResult = await this.blogModel.updateOne({ _id: new ObjectId(id) }, { $set: input }).exec();
    return res.modifiedCount > 0;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    const res: DeleteResult = await this.blogModel
      .deleteOne({
        _id: new ObjectId(id),
      })
      .exec();
    return res.deletedCount > 0;
  }

  async saveDoc(doc: BlogDocumentType): Promise<void> {
    await doc.save();
  }

  async clear(): Promise<void> {
    await this.blogModel.deleteMany({});
  }
}
