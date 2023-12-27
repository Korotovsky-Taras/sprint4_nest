import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './posts.schema';
import { IPost, IPostModel, PostDBType, PostDocumentType } from '../../types/dao';
import { IPostsRepository } from '../../types/common';
import { PostCreateModel, PostViewModel } from '../../types/dto';
import { PostUpdateDto } from '../../dto/PostUpdateDto';
import { LikeStatus } from '../../../likes/types';
import { PostsMongoDataMapper } from './posts.mongo.dm';
import { UserIdReq } from '../../../../application/utils/types';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { BlogPostUpdateDto } from '../../../blogs/dto/BlogPostUpdateDto';

@Injectable()
export class PostsMongoRepository implements IPostsRepository<PostDocumentType> {
  constructor(@InjectModel(Post.name) private postModel: IPostModel) {}

  async createPost(input: PostCreateModel, userId: UserIdReq): Promise<PostViewModel> {
    const post: PostDocumentType = this.postModel.createPost(input);
    await this.saveDoc(post);
    return PostsMongoDataMapper.toPostView(post, userId);
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

  async isPostByIdExist(postId: string): Promise<boolean> {
    if (!isValidObjectId(postId)) {
      return false;
    }
    return this.isPostExist({ _id: new ObjectId(postId) });
  }

  async deletePostById(postId: string): Promise<boolean> {
    return this.deletePost({ _id: new ObjectId(postId) });
  }

  async isBlogPostByIdExist(blogId: string, postId: string): Promise<boolean> {
    return this.isPostExist({ blogId, _id: new ObjectId(postId) });
  }

  async deleteBlogPostById(blogId: string, postId: string): Promise<boolean> {
    return this.deletePost({ blogId, _id: new ObjectId(postId) });
  }

  async updateBlogPostById(blogId: string, postId: string, dto: BlogPostUpdateDto): Promise<boolean> {
    const res: UpdateResult = await this.postModel
      .updateOne(
        { blogId, _id: new ObjectId(postId) },
        {
          $set: {
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
          },
        },
      )
      .exec();
    return res.modifiedCount > 0;
  }

  private async deletePost(filter: FilterQuery<IPost>): Promise<boolean> {
    const res: DeleteResult = await this.postModel.deleteOne(filter).exec();
    return res.deletedCount > 0;
  }

  private async isPostExist(filter: FilterQuery<IPost>): Promise<boolean> {
    const query = this.postModel.where(filter);
    const post: PostDBType | null = await query.findOne().lean();
    return !!post;
  }

  async saveDoc(doc: PostDocumentType): Promise<void> {
    await doc.save();
  }

  async clear(): Promise<void> {
    await this.postModel.deleteMany({});
  }
}
