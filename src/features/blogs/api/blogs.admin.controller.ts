import { Body, Controller, Delete, Get, HttpCode, Inject, Injectable, NotFoundException, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { BlogQueryRepoKey, IBlogsAdminController, IBlogsQueryRepository } from '../types/common';
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
import { UpdateBlogPostByIdCommand } from '../use-cases/udpate-post-by-id.case';
import { DeleteBlogPostByIdCommand } from '../use-cases/delete-post-by-id.case';
import { BlogPostUpdateDto } from '../dto/BlogPostUpdateDto';
import { ParamId } from '../../../application/decorators/params/getParamNumberId';

@Injectable()
@Controller('sa/blogs')
@UseGuards(AuthBasicGuard)
export class BlogsAdminController implements IBlogsAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(BlogQueryRepoKey) private readonly blogsQueryRepo: IBlogsQueryRepository,
    @Inject(PostQueryRepoKey) private postsQueryRepo: IPostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(Status.OK)
  async getAll(@Query() query: BlogPaginationQueryDto): Promise<WithPagination<any>> {
    return await this.blogsQueryRepo.getBlogs(query);
  }

  @Post()
  @HttpCode(Status.CREATED)
  async createBlog(@Body() dto: BlogCreateDto): Promise<BlogViewModel | null> {
    return await this.commandBus.execute<CreateBlogCommand, BlogViewModel>(new CreateBlogCommand(dto));
  }

  @Put(':id')
  @HttpCode(Status.NO_CONTENT)
  async updateBlog(@ParamId('id') blogId: string, @Body() input: BlogUpdateDto) {
    const result: ServiceResult = await this.commandBus.execute<UpdateBlogByIdCommand, ServiceResult>(new UpdateBlogByIdCommand(blogId, input));

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(Status.NO_CONTENT)
  async deleteBlog(@ParamId('id') blogId: string) {
    const result: ServiceResult = await this.commandBus.execute<DeleteBlogByIdCommand, ServiceResult>(new DeleteBlogByIdCommand(blogId));

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Get('/:id/posts')
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getBlogPosts(@ParamId('id') blogId: string, @Query() query: PostPaginationQueryDto, @Req() req: Request): Promise<WithPagination<PostViewModel>> {
    const blog: BlogViewModel | null = await this.blogsQueryRepo.getBlogById(blogId);
    if (blog) {
      return await this.postsQueryRepo.getBlogPosts(req.userId, blogId, query);
    }
    throw new NotFoundException();
  }

  @Post('/:id/posts')
  @HttpCode(Status.CREATED)
  async createBlogPost(@ParamId('id') blogId: string, @Body() dto: BlogPostCreateDto, @Req() req: Request): Promise<PostViewModel> {
    const result: ServiceResult<PostViewModel> = await this.commandBus.execute<CreateBlogPostCommand, ServiceResult<PostViewModel>>(
      new CreateBlogPostCommand(req.userId, blogId, dto),
    );

    if (result.hasErrorCode(BlogServiceError.BLOG_NOT_FOUND)) {
      throw new NotFoundException();
    }

    return result.getData();
  }

  @Put('/:blogId/posts/:postId')
  @HttpCode(Status.NO_CONTENT)
  async updateBlogPost(@ParamId('blogId') blogId: string, @ParamId('postId') postId: string, @Body() dto: BlogPostUpdateDto): Promise<void> {
    const result = await this.commandBus.execute<UpdateBlogPostByIdCommand, ServiceResult>(new UpdateBlogPostByIdCommand(blogId, postId, dto));

    if (result.hasErrorCode(BlogServiceError.POST_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Delete('/:blogId/posts/:postId')
  @HttpCode(Status.NO_CONTENT)
  async deleteBlogPost(@ParamId('blogId') blogId: string, @ParamId('postId') postId: string): Promise<void> {
    const result = await this.commandBus.execute<DeleteBlogPostByIdCommand, ServiceResult>(new DeleteBlogPostByIdCommand(blogId, postId));

    if (result.hasErrorCode(BlogServiceError.POST_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }
}
