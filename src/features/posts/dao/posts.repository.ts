import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './posts.schema';
import { IPostModel, PostDocumentType } from '../types/dao';
import { IPostsRepository, PostMapperType } from '../types/common';
import { PostCreateDto, PostUpdateDto } from '../types/dto';

@Injectable()
export class PostsRepository implements IPostsRepository {
  constructor(@InjectModel(Post.name) private postModel: IPostModel) {}

  async createPost<T>(userId: string | null, input: PostCreateDto, dto: PostMapperType<T>): Promise<T> {
    const model: PostDocumentType = this.postModel.createPost(input);
    await this.saveDoc(model);
    return dto(model, userId);
  }

  async updatePostById(id: string, input: PostUpdateDto): Promise<boolean> {
    const res: UpdateResult = await this.postModel.updateOne({ _id: new ObjectId(id) }, { $set: input }).exec();
    return res.modifiedCount > 0;
  }

  async deletePostById(id: string): Promise<boolean> {
    const res: DeleteResult = await this.postModel.deleteOne({ _id: new ObjectId(id) }).exec();
    return res.deletedCount > 0;
  }

  async saveDoc(doc: PostDocumentType): Promise<void> {
    await doc.save();
  }

  async clear(): Promise<void> {
    await this.postModel.deleteMany({});
  }
}
