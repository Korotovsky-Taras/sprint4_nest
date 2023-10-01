import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../dao/blogs.repository';
import { BlogsQueryRepository } from '../dao/blogs.query.repository';
import { BlogsDataMapper } from '../api/blogs.dm';
import { IBlogService } from '../types/common';
import { BlogViewDto } from '../types/dto';
import { PostViewDto } from '../../posts/types/dto';
import { PostsDataMapper } from '../../posts/api/posts.dm';
import { PostsRepository } from '../../posts/dao/posts.repository';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UserIdReq } from '../../../application/utils/types';
import { BlogPostCreateDto } from '../dto/BlogPostCreateDto';
import { BlogCreateDto } from '../dto/BlogCreateDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { BlogUpdateDto } from '../dto/BlogUpdateDto';

@Injectable()
export class BlogsService implements IBlogService {
  constructor(
    private readonly blogsRepo: BlogsRepository,
    private readonly blogsQueryRepo: BlogsQueryRepository,
    private readonly postsRepo: PostsRepository,
  ) {}

  async createBlog(dto: BlogCreateDto): Promise<BlogViewDto> {
    await validateOrRejectDto(dto, BlogCreateDto);
    return await this.blogsRepo.createBlog(dto, BlogsDataMapper.toBlogView);
  }

  async createPost(userId: UserIdReq, blogId: string, dto: BlogPostCreateDto): Promise<ServiceResult<PostViewDto>> {
    await validateOrRejectDto(dto, BlogPostCreateDto);

    const blog: BlogViewDto | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    const result = new ServiceResult<PostViewDto>();

    if (!blog) {
      result.addError({
        message: 'Blog not found',
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
      return result;
    }

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

    return result;
  }

  async updateBlogById(blogId: string, dto: BlogUpdateDto): Promise<ServiceResult<boolean>> {
    await validateOrRejectDto(dto, BlogUpdateDto);

    const blog: BlogViewDto | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    const result = new ServiceResult<boolean>();

    if (!blog) {
      result.addError({
        message: 'Blog not found',
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
      return result;
    }

    const idUpdated = await this.blogsRepo.updateBlogById(blogId, dto);
    result.setData(idUpdated);

    return result;
  }

  async deleteBlogById(blogId: string): Promise<ServiceResult<boolean>> {
    const blog: BlogViewDto | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    const result = new ServiceResult<boolean>();

    if (!blog) {
      result.addError({
        message: 'Blog not found',
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
      return result;
    }

    const idDeleted = await this.blogsRepo.deleteBlogById(blogId);
    result.setData(idDeleted);
    return result;
  }
}

export enum BlogServiceError {
  BLOG_NOT_FOUND = 1,
}
