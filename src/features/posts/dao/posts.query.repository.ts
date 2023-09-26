import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './posts.schema';
import { IPostModel, PostMongoType } from '../types/dao';
import { withModelPagination } from '../../../utils/withModelPagination';
import { PostPaginationRepositoryDto } from '../types/dto';
import { IPostsQueryRepository, PostListMapperType, PostMapperType } from '../types/common';
import { UserIdReq, WithPagination } from '../../../utils/types';

@Injectable()
export class PostsQueryRepository implements IPostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: IPostModel) {}

  async getPosts<T>(
    userId: string | null,
    filter: Partial<PostMongoType>,
    query: PostPaginationRepositoryDto,
    dto: PostListMapperType<T>,
  ): Promise<WithPagination<T>> {
    return withModelPagination<PostMongoType, T>(this.postModel, filter, query, (items) => {
      return dto(items, userId);
    });
  }

  async getPostById<T>(userId: UserIdReq, id: string, dto: PostMapperType<T>): Promise<T | null> {
    const post: PostMongoType | null = await this.postModel.findById(id).lean();
    if (post) {
      return dto(post, userId);
    }
    return null;
  }

  async isPostExist(id: string): Promise<boolean> {
    const post: PostMongoType | null = await this.postModel.findById(id).lean();
    return !!post;
  }
}
