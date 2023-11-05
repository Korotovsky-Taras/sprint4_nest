import { Body, Controller, Delete, Get, HttpCode, Inject, Injectable, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { BlogsDataMapper } from './blogs.dm';
import { Request } from 'express';
import { BlogQueryRepoKey, IBlogsController, IBlogsQueryRepository } from '../types/common';
import { BlogViewModel } from '../types/dto';
import { PostViewModel } from '../../posts/types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { Status, WithPagination } from '../../../application/utils/types';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { AuthBasicGuard } from '../../../application/guards/AuthBasicGuard';
import { BlogPostCreateDto } from '../dto/BlogPostCreateDto';
import { BlogCreateDto } from '../dto/BlogCreateDto';
import { BlogUpdateDto } from '../dto/BlogUpdateDto';
import { SetTokenGuardParams } from '../../../application/decorators/skipTokenError';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogPostCommand } from '../use-cases/create-post.case';
import { UpdateBlogByIdCommand } from '../use-cases/update-blog-by-id.case';
import { DeleteBlogByIdCommand } from '../use-cases/delete-blog-by-id.case';
import { BlogServiceError } from '../types/errors';
import { CreateBlogCommand } from '../use-cases/create-blog.case';
import { Promise } from 'mongoose';
import { BlogPaginationQueryDto } from '../dto/BlogPaginationQueryDto';
import { PostPaginationQueryDto } from '../../posts/dto/PostPaginationQueryDto';
import { IPostsQueryRepository, PostQueryRepoKey } from '../../posts/types/common';

@Injectable()
@Controller('blogs')
export class BlogsController implements IBlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(BlogQueryRepoKey) private readonly blogsQueryRepo: IBlogsQueryRepository,
    @Inject(PostQueryRepoKey) private postsQueryRepo: IPostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(Status.OK)
  async getAll(@Query() query: BlogPaginationQueryDto): Promise<WithPagination<any>> {
    return await this.blogsQueryRepo.getBlogs(query, BlogsDataMapper.toBlogsView);
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
  async createBlog(@Body() dto: BlogCreateDto): Promise<BlogViewModel | null> {
    return await this.commandBus.execute<CreateBlogCommand, BlogViewModel>(new CreateBlogCommand(dto));
  }

  @Get('/:id/posts')
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getBlogPosts(@Param('id') blogId: string, @Query() query: PostPaginationQueryDto, @Req() req: Request): Promise<WithPagination<PostViewModel>> {
    const blog: BlogViewModel | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    if (blog) {
      return await this.postsQueryRepo.getBlogPosts(req.userId, blogId, query);
    }
    throw new NotFoundException();
  }

  @Post('/:id/posts')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.CREATED)
  async createBlogPost(@Param('id') blogId: string, @Body() dto: BlogPostCreateDto, @Req() req: Request): Promise<PostViewModel> {
    const result: ServiceResult<PostViewModel> = await this.commandBus.execute<CreateBlogPostCommand, ServiceResult<PostViewModel>>(
      new CreateBlogPostCommand(req.userId, blogId, dto),
    );

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }

    return result.getData();
  }

  @Put(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.NO_CONTENT)
  async updateBlog(@Param('id') blogId: string, @Body() input: BlogUpdateDto) {
    const result: ServiceResult = await this.commandBus.execute<UpdateBlogByIdCommand, ServiceResult>(new UpdateBlogByIdCommand(blogId, input));

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    const result: ServiceResult = await this.commandBus.execute<DeleteBlogByIdCommand, ServiceResult>(new DeleteBlogByIdCommand(blogId));

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }
}
