import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../dao/posts.repository';
import { PostsQueryRepository } from '../dao/posts.query.repository';
import { BlogsQueryRepository } from '../../blogs/dao/blogs.query.repository';
import { PostLikeStatusInputModel, PostViewModel } from '../types/dto';
import { BlogsDataMapper } from '../../blogs/api/blogs.dm';
import { BlogViewModel } from '../../blogs/types/dto';
import { PostsDataMapper } from '../api/posts.dm';
import { UserIdReq } from '../../../application/utils/types';
import { IPostsService } from '../types/common';
import { PostCreateDto } from '../dto/PostCreateDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { PostUpdateDto } from '../dto/PostUpdateDto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UsersQueryRepository } from '../../users/dao/users.query.repository';
import { InjectModel } from '@nestjs/mongoose';
import { IPostModel, PostDocumentType } from '../types/dao';
import { Post } from '../dao/posts.schema';
import { ObjectId } from 'mongodb';
import { UsersDataMapper } from '../../users/api/users.dm';
import { UserViewModel } from '../../users/types/dto';

@Injectable()
export class PostsService implements IPostsService {
  constructor(
    @InjectModel(Post.name) private postModel: IPostModel,
    private readonly postsRepo: PostsRepository,
    private readonly postsQueryRepo: PostsQueryRepository,
    private readonly blogsQueryRepo: BlogsQueryRepository,
    private readonly usersQueryRepo: UsersQueryRepository,
  ) {}

  async createPost(userId: UserIdReq, dto: PostCreateDto): Promise<PostViewModel | null> {
    await validateOrRejectDto(dto, PostCreateDto);

    const blog: BlogViewModel | null = await this.blogsQueryRepo.getBlogById(dto.blogId, BlogsDataMapper.toBlogView);
    if (blog) {
      return this.postsRepo.createPost(
        userId,
        {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: blog.id,
          blogName: blog.name,
        },
        PostsDataMapper.toPostView,
      );
    }
    return null;
  }

  async updateLikeStatus(input: PostLikeStatusInputModel): Promise<ServiceResult> {
    const result = new ServiceResult();

    const userModel: UserViewModel | null = await this.usersQueryRepo.getUserById(input.userId, UsersDataMapper.toUserView);

    if (userModel == null) {
      result.addError({
        code: PostLikeServiceError.UNAUTHORIZED,
      });
      return result;
    }

    const post: PostDocumentType | null = await this.postModel.findOne({ _id: new ObjectId(input.postId) }).exec();

    if (post === null) {
      result.addError({
        code: PostLikeServiceError.POST_NO_FOUND,
      });
      return result;
    }

    await post.updateLike(userModel.id, userModel.login, input.status);

    await this.postsRepo.saveDoc(post);

    return result;
  }

  async updatePostById(blogId: string, dto: PostUpdateDto): Promise<boolean> {
    return this.postsRepo.updatePostById(blogId, dto);
  }

  async deletePostById(blogId: string): Promise<boolean> {
    return this.postsRepo.deletePostById(blogId);
  }
}

export enum PostLikeServiceError {
  UNAUTHORIZED = 1,
  POST_NO_FOUND = 2,
}
