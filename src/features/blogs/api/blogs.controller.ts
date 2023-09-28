import { Body, Controller, Delete, Get, HttpCode, Injectable, NotFoundException, Param, Post, Put, Query, Req } from '@nestjs/common';
import { BlogsDataMapper } from './blogs.dm';
import { BlogServiceError, BlogsService } from '../domain/blogs.service';
import { BlogsQueryRepository } from '../dao/blogs.query.repository';
import { Request } from 'express';
import { IBlogsController } from '../types/common';
import { BlogCreateDto, BlogPaginationQueryDto, BlogPostCreateDto, BlogUpdateDto, BlogViewDto } from '../types/dto';
import { PostsDataMapper } from '../../posts/api/posts.dm';
import { PostsQueryRepository } from '../../posts/dao/posts.query.repository';
import { PostPaginationQueryDto, PostViewDto } from '../../posts/types/dto';
import { ServiceResult } from '../../../application/errors/ServiceResult';
import { Status, WithPagination } from '../../../application/utils/types';

@Injectable()
@Controller('blogs')
export class BlogsController implements IBlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepo: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(Status.OK)
  async getAll(@Query() query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewDto>> {
    return await this.blogsQueryRepo.getBlogs(BlogsDataMapper.toRepoQuery(query), BlogsDataMapper.toBlogsView);
  }

  @Get('/:id')
  @HttpCode(Status.OK)
  async getBlog(@Param('id') blogId: string): Promise<BlogViewDto> {
    const blog: BlogViewDto | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    if (blog) {
      return blog;
    }
    throw new NotFoundException();
  }

  @Post()
  @HttpCode(Status.CREATED)
  async createBlog(@Body() input: BlogCreateDto): Promise<BlogViewDto> {
    return await this.blogsService.createBlog(input);
  }

  @Get('/:id/posts')
  @HttpCode(Status.OK)
  async getBlogPosts(@Param('id') blogId: string, @Query() query: PostPaginationQueryDto, @Req() req: Request): Promise<WithPagination<PostViewDto>> {
    const blog: BlogViewDto | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    if (blog) {
      return await this.postsQueryRepository.getPosts(req.userId, { blogId }, PostsDataMapper.toRepoQuery(query), PostsDataMapper.toPostsView);
    }
    throw new NotFoundException();
  }

  @Post('/:id/posts')
  @HttpCode(Status.CREATED)
  async createBlogPost(@Param('id') blogId: string, @Body() input: BlogPostCreateDto, @Req() req: Request): Promise<PostViewDto> {
    const result: ServiceResult<PostViewDto> = await this.blogsService.createPost(req.userId, blogId, {
      title: input.title,
      shortDescription: input.shortDescription,
      content: input.content,
    });

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }

    return result.getData();
  }

  @Put(':id')
  @HttpCode(Status.NO_CONTENT)
  async updateBlog(@Param('id') blogId: string, @Body() input: BlogUpdateDto) {
    const result: ServiceResult<boolean> = await this.blogsService.updateBlogById(blogId, input);

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(Status.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    const result: ServiceResult<boolean> = await this.blogsService.deleteBlogById(blogId);

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }
}
