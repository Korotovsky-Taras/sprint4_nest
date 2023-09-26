import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../dao/posts.repository';
import { PostsQueryRepository } from '../dao/posts.query.repository';
import { BlogsQueryRepository } from '../../blogs/dao/blogs.query.repository';
import { PostCreateDto, PostUpdateDto, PostViewDto } from '../types/dto';
import { BlogsDataMapper } from '../../blogs/api/blogs.dm';
import { BlogViewDto } from '../../blogs/types/dto';
import { PostsDataMapper } from '../api/posts.dm';
import { UserIdReq } from '../../../utils/types';
import { IPostsService } from '../types/common';

@Injectable()
export class PostsService implements IPostsService {
  constructor(
    private readonly postsRepo: PostsRepository,
    private readonly postsQueryRepo: PostsQueryRepository,
    private readonly blogsQueryRepo: BlogsQueryRepository,
  ) {}

  async createPost(userId: UserIdReq, model: PostCreateDto): Promise<PostViewDto | null> {
    const blog: BlogViewDto | null = await this.blogsQueryRepo.getBlogById(model.blogId, BlogsDataMapper.toBlogView);
    if (blog) {
      return this.postsRepo.createPost(
        userId,
        {
          title: model.title,
          shortDescription: model.shortDescription,
          content: model.content,
          blogId: blog.id,
          blogName: blog.name,
        },
        PostsDataMapper.toPostView,
      );
    }
    return null;
  }

  async updatePostById(blogId: string, model: PostUpdateDto): Promise<boolean> {
    return this.postsRepo.updatePostById(blogId, model);
  }

  async deletePostById(blogId: string): Promise<boolean> {
    return this.postsRepo.deletePostById(blogId);
  }
}
