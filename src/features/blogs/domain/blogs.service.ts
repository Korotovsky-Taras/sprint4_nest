import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../dao/blogs.repository';
import { BlogsQueryRepository } from '../dao/blogs.query.repository';
import { BlogsDataMapper } from '../api/blogs.dm';
import { IBlogService } from '../types/common';
import { BlogCreateDto, BlogPostCreateDto, BlogUpdateDto, BlogViewDto } from '../types/dto';
import { UserIdReq } from '../../../utils/types';
import { PostViewDto } from '../../posts/types/dto';
import { PostsDataMapper } from '../../posts/api/posts.dm';
import { PostsRepository } from '../../posts/dao/posts.repository';
import { ServiceResult } from '../../../application/ServiceResult';

@Injectable()
export class BlogsService implements IBlogService {
  constructor(
    private readonly blogsRepo: BlogsRepository,
    private readonly blogsQueryRepo: BlogsQueryRepository,
    private readonly postsRepo: PostsRepository,
  ) {}

  async createBlog(dto: BlogCreateDto): Promise<BlogViewDto> {
    return await this.blogsRepo.createBlog(dto, BlogsDataMapper.toBlogView);
  }

  async createPost(userId: UserIdReq, blogId: string, dto: BlogPostCreateDto): Promise<ServiceResult<PostViewDto>> {
    const blog: BlogViewDto | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    const result = new ServiceResult<PostViewDto>();

    if (blog) {
      const post: PostViewDto = await this.postsRepo.createPost(
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
      result.setData(post);
    } else {
      result.addError({
        message: 'Blog not found',
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
    }

    return result;
  }

  async updateBlogById(blogId: string, input: BlogUpdateDto): Promise<ServiceResult<boolean>> {
    const blog: BlogViewDto | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    const result = new ServiceResult<boolean>();

    if (blog) {
      const idUpdated = await this.blogsRepo.updateBlogById(blogId, input);
      result.setData(idUpdated);
    } else {
      result.addError({
        message: 'Blog not found',
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
    }

    return result;
  }

  async deleteBlogById(blogId: string): Promise<ServiceResult<boolean>> {
    const blog: BlogViewDto | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    const result = new ServiceResult<boolean>();

    if (blog) {
      const idDeleted = await this.blogsRepo.deleteBlogById(blogId);
      result.setData(idDeleted);
    } else {
      result.addError({
        message: 'Blog not found',
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
    }
    return result;
  }
}

export enum BlogServiceError {
  BLOG_NOT_FOUND = 1,
}
