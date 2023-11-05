import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './posts.schema';
import { IPostModel, PostDBType } from '../../types/dao';
import { IPostsQueryRepository } from '../../types/common';
import { withMongoPagination } from '../../../../application/utils/withMongoPagination';
import { UserIdReq, WithPagination } from '../../../../application/utils/types';
import { PostPaginationQueryDto } from '../../dto/PostPaginationQueryDto';
import { PostViewModel } from '../../types/dto';
import { PostsMongoDataMapper } from '../../api/posts.mongo.dm';

@Injectable()
export class PostsMongoQueryRepository implements IPostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: IPostModel) {}

  async getBlogPosts(userId: string | null, blogId: string, query: PostPaginationQueryDto): Promise<WithPagination<PostViewModel>> {
    return withMongoPagination<PostDBType, PostViewModel>(this.postModel, { blogId }, query, (items) => {
      return PostsMongoDataMapper.toPostsView(items, userId);
    });
  }

  async getAllPosts(userId: string | null, query: PostPaginationQueryDto): Promise<WithPagination<PostViewModel>> {
    return withMongoPagination<PostDBType, PostViewModel>(this.postModel, {}, query, (items) => {
      return PostsMongoDataMapper.toPostsView(items, userId);
    });
  }

  async getPostById(userId: UserIdReq, id: string): Promise<PostViewModel | null> {
    const post: PostDBType | null = await this.postModel.findById(id).lean();
    if (post) {
      return PostsMongoDataMapper.toPostView(post, userId);
    }
    return null;
  }

  async isPostExist(id: string): Promise<boolean> {
    const post: PostDBType | null = await this.postModel.findById(id).lean();
    return !!post;
  }
}
