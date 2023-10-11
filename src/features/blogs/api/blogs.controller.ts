import { Body, Controller, Delete, Get, HttpCode, Injectable, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { BlogsDataMapper } from './blogs.dm';
import { BlogsService } from '../domain/blogs.service';
import { BlogsQueryRepository } from '../dao/blogs.query.repository';
import { Request } from 'express';
import { IBlogsController } from '../types/common';
import { BlogPaginationQueryModel, BlogViewModel } from '../types/dto';
import { PostsDataMapper } from '../../posts/api/posts.dm';
import { PostsQueryRepository } from '../../posts/dao/posts.query.repository';
import { PostPaginationQueryModel, PostViewModel } from '../../posts/types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { Status, WithPagination } from '../../../application/utils/types';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { AuthBasicGuard } from '../../../application/guards/AuthBasicGuard';
import { BlogPostCreateDto } from '../dto/BlogPostCreateDto';
import { BlogCreateDto } from '../dto/BlogCreateDto';
import { BlogUpdateDto } from '../dto/BlogUpdateDto';
import { SetTokenGuardParams } from '../../../application/decorators/skipTokenError';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../use-cases/create-post.case';
import { UpdateBlogByIdCommand } from '../use-cases/update-blog-by-id.case';
import { DeleteBlogByIdCommand } from '../use-cases/delete-blog-by-id.case';
import { BlogServiceError } from '../types/errors';
import { CreateBlogCommand } from '../use-cases/create-blog.case';
import { Promise } from 'mongoose';

@Injectable()
@Controller('blogs')
export class BlogsController implements IBlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepo: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(Status.OK)
  async getAll(@Query() query: BlogPaginationQueryModel): Promise<WithPagination<BlogViewModel>> {
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
  async createBlog(@Body() dto: BlogCreateDto): Promise<BlogViewModel | null> {
    return await this.commandBus.execute<CreateBlogCommand, BlogViewModel>(new CreateBlogCommand(dto));
  }

  @Get('/:id/posts')
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getBlogPosts(@Param('id') blogId: string, @Query() query: PostPaginationQueryModel, @Req() req: Request): Promise<WithPagination<PostViewModel>> {
    const blog: BlogViewModel | null = await this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView);
    if (blog) {
      return await this.postsQueryRepository.getPosts(req.userId, { blogId }, PostsDataMapper.toRepoQuery(query), PostsDataMapper.toPostsView);
    }
    throw new NotFoundException();
  }

  @Post('/:id/posts')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.CREATED)
  async createBlogPost(@Param('id') blogId: string, @Body() dto: BlogPostCreateDto, @Req() req: Request): Promise<PostViewModel> {
    const result: ServiceResult<PostViewModel> = await this.commandBus.execute<CreatePostCommand, ServiceResult<PostViewModel>>(
      new CreatePostCommand(req.userId, blogId, dto),
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
