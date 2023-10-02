import { Body, Controller, Delete, Get, HttpCode, Injectable, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { BlogsDataMapper } from './blogs.dm';
import { BlogServiceError, BlogsService } from '../domain/blogs.service';
import { BlogsQueryRepository } from '../dao/blogs.query.repository';
import { Request } from 'express';
import { IBlogsController } from '../types/common';
import { BlogPaginationQueryDto, BlogViewModel } from '../types/dto';
import { PostsDataMapper } from '../../posts/api/posts.dm';
import { PostsQueryRepository } from '../../posts/dao/posts.query.repository';
import { PostPaginationQueryDto, PostViewModel } from '../../posts/types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { Status, WithPagination } from '../../../application/utils/types';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { AuthBasicGuard } from '../../../application/guards/AuthBasicGuard';
import { BlogPostCreateDto } from '../dto/BlogPostCreateDto';
import { BlogCreateDto } from '../dto/BlogCreateDto';
import { BlogUpdateDto } from '../dto/BlogUpdateDto';
import { SetTokenGuardParams } from '../../../application/decorators/skipTokenError';

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
  async getAll(@Query() query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewModel>> {
    return await this.blogsQueryRepo.getBlogs(BlogsDataMapper.toRepoQuery(query), BlogsDataMapper.toBlogsView);
  }

  @Get('/:id')
  @HttpCode(Status.OK)
  async getBlog(@Param('id') blogId: string): Promise<BlogViewModel> {
    const blog: BlogViewModel | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    if (blog) {
      return blog;
    }
    throw new NotFoundException();
  }

  @Post()
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.CREATED)
  async createBlog(@Body() input: BlogCreateDto): Promise<BlogViewModel> {
    return await this.blogsService.createBlog(input);
  }

  @Get('/:id/posts')
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getBlogPosts(@Param('id') blogId: string, @Query() query: PostPaginationQueryDto, @Req() req: Request): Promise<WithPagination<PostViewModel>> {
    const blog: BlogViewModel | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    if (blog) {
      return await this.postsQueryRepository.getPosts(req.userId, { blogId }, PostsDataMapper.toRepoQuery(query), PostsDataMapper.toPostsView);
    }
    throw new NotFoundException();
  }

  @Post('/:id/posts')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.CREATED)
  async createBlogPost(@Param('id') blogId: string, @Body() input: BlogPostCreateDto, @Req() req: Request): Promise<PostViewModel> {
    const result: ServiceResult<PostViewModel> = await this.blogsService.createPost(req.userId, blogId, {
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
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.NO_CONTENT)
  async updateBlog(@Param('id') blogId: string, @Body() input: BlogUpdateDto) {
    const result: ServiceResult<boolean> = await this.blogsService.updateBlogById(blogId, input);

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    const result: ServiceResult<boolean> = await this.blogsService.deleteBlogById(blogId);

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }
}
