import { Controller, Get, HttpCode, Inject, Injectable, NotFoundException, Param, Query, Req, UseGuards } from '@nestjs/common';
import { BlogsDataMapper } from './blogs.dm';
import { Request } from 'express';
import { BlogQueryRepoKey, IBlogsController, IBlogsQueryRepository } from '../types/common';
import { BlogViewModel } from '../types/dto';
import { PostViewModel } from '../../posts/types/dto';
import { Status, WithPagination } from '../../../application/utils/types';
import { CommandBus } from '@nestjs/cqrs';
import { Promise } from 'mongoose';
import { BlogPaginationQueryDto } from '../dto/BlogPaginationQueryDto';
import { PostPaginationQueryDto } from '../../posts/dto/PostPaginationQueryDto';
import { IPostsQueryRepository, PostQueryRepoKey } from '../../posts/types/common';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { SetTokenGuardParams } from '../../../application/decorators/skipTokenError';

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
  async getAll(@Query() query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewModel>> {
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
}
