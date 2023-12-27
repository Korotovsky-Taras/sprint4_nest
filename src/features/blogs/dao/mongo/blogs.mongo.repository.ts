import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './blogs.mongo.schema';
import { IBlogsRepository } from '../../types/common';
import { BlogDocumentType, IBlogModel } from '../../types/dao';
import { BlogCreateDto } from '../../dto/BlogCreateDto';
import { BlogUpdateDto } from '../../dto/BlogUpdateDto';
import { isValidObjectId } from 'mongoose';
import { BlogsMongoDataMapper } from './blogs.mongo.dm';
import { BlogViewModel } from '../../types/dto';

@Injectable()
export class BlogsMongoRepository implements IBlogsRepository<BlogDocumentType> {
  constructor(@InjectModel(Blog.name) private blogModel: IBlogModel) {}

  async createBlog(input: BlogCreateDto): Promise<BlogViewModel> {
    const model: BlogDocumentType = this.blogModel.createBlog(input);
    await this.saveDoc(model);
    return BlogsMongoDataMapper.toBlogView(model);
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

  async getBlogById(id: string): Promise<BlogViewModel | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const blog: BlogDocumentType | null = await this.blogModel.findById(id).exec();
    if (blog != null) {
      return BlogsMongoDataMapper.toBlogView(blog);
    }
    return null;
  }

  async saveDoc(doc: BlogDocumentType): Promise<void> {
    await doc.save();
  }

  async clear(): Promise<void> {
    await this.blogModel.deleteMany({});
  }
}
