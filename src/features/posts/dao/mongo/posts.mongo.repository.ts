import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './posts.schema';
import { IPostModel, PostDBType, PostDocumentType } from '../../types/dao';
import { IPostsRepository } from '../../types/common';
import { PostCreateModel, PostViewModel } from '../../types/dto';
import { PostUpdateDto } from '../../dto/PostUpdateDto';
import { LikeStatus } from '../../../likes/types';
import { PostsMongoDataMapper } from '../../api/posts.mongo.dm';
import { UserIdReq } from '../../../../application/utils/types';

@Injectable()
export class PostsMongoRepository implements IPostsRepository {
  constructor(@InjectModel(Post.name) private postModel: IPostModel) {}

  async createPost(input: PostCreateModel, userId: UserIdReq): Promise<PostViewModel> {
    const post: PostDocumentType = this.postModel.createPost(input);
    await this.saveDoc(post);
    return PostsMongoDataMapper.toPostView(post, userId);
  }

  async updatePostById(id: string, dto: PostUpdateDto): Promise<boolean> {
    const res: UpdateResult = await this.postModel
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            blogId: dto.blogId,
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
          },
        },
      )
      .exec();
    return res.modifiedCount > 0;
  }

  async updateLike(postId: string, likeStatus: LikeStatus, userId: string, userLogin: string): Promise<boolean> {
    const post: PostDocumentType | null = await this.postModel.findOne({ _id: new ObjectId(postId) }).exec();
    if (!post) {
      return false;
    }
    post.updateLike(userId, userLogin, likeStatus);
    await this.saveDoc(post);
    return true;
  }

  async isPostExist(postId: string): Promise<boolean> {
    const post: PostDBType | null = await this.postModel.findById(postId).lean();
    return !!post;
  }

  async getPostById(postId: string): Promise<PostDBType | null> {
    return this.postModel.findById(postId).lean();
  }

  async deletePostById(postId: string): Promise<boolean> {
    const res: DeleteResult = await this.postModel.deleteOne({ _id: new ObjectId(postId) }).exec();
    return res.deletedCount > 0;
  }

  async saveDoc(doc: PostDocumentType): Promise<void> {
    await doc.save();
  }

  async clear(): Promise<void> {
    await this.postModel.deleteMany({});
  }
}
