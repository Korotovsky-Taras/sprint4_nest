import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Injectable, NotFoundException, Param, Post, Put, Query, Req } from '@nestjs/common';
import { IPostsController } from '../types/common';
import { PostsService } from '../domain/posts.service';
import { PostsDataMapper } from './posts.dm';
import { PostsQueryRepository } from '../dao/posts.query.repository';
import { PaginationQueryModel, Status, WithPagination } from '../../../utils/types';
import { IPost } from '../types/dao';
import { PostCommentCreateDto, PostCreateDto, PostUpdateDto, PostViewDto } from '../types/dto';
import { Request } from 'express';
import { CommentViewDto } from '../../comments/types/dto';
import { CommentServiceError, CommentsService } from '../../comments/domain/comments.service';
import { CommentsQueryRepository } from '../../comments/dao/comments.query.repository';
import { CommentsDataMapper } from '../../comments/api/comments.dm';
import { IComment } from '../../comments/types/dao';
import { ServiceResult } from '../../../application/ServiceResult';

@Injectable()
@Controller('posts')
export class PostsController implements IPostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepo: CommentsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: PaginationQueryModel<IPost>, @Req() req: Request): Promise<WithPagination<PostViewDto>> {
    return await this.postsQueryRepository.getPosts(req.userId, {}, PostsDataMapper.toRepoQuery(query), PostsDataMapper.toPostsView);
  }

  @Get(':id')
  @HttpCode(Status.OK)
  async getPost(@Param('id') postId: string, @Body() input: PostCreateDto, @Req() req: Request): Promise<PostViewDto> {
    const post: PostViewDto | null = await this.postsQueryRepository.getPostById(req.userId, postId, PostsDataMapper.toPostView);
    if (post) {
      return post;
    }
    throw new NotFoundException();
  }

  @Post()
  @HttpCode(Status.CREATED)
  async createPost(@Body() input: PostCreateDto, @Req() req: Request): Promise<PostViewDto> {
    const post: PostViewDto | null = await this.postsService.createPost(req.userId, input);
    if (post) {
      return post;
    }
    throw new BadRequestException();
  }

  @Put(':id')
  @HttpCode(Status.NO_CONTENT)
  async updatePost(@Param('id') postId: string, @Body() input: PostUpdateDto): Promise<void> {
    const postExist: boolean = await this.postsQueryRepository.isPostExist(postId);
    if (!postExist) {
      throw new NotFoundException();
    }
    await this.postsService.updatePostById(postId, input);
  }

  @Delete(':id')
  @HttpCode(Status.NO_CONTENT)
  async deletePost(@Param('id') postId: string): Promise<void> {
    const postExist: boolean = await this.postsQueryRepository.isPostExist(postId);
    if (!postExist) {
      throw new NotFoundException();
    }
    await this.postsService.deletePostById(postId);
  }

  @Get('/:id/comments')
  @HttpCode(Status.OK)
  async getComments(@Param('id') postId: string, @Query() query: PaginationQueryModel<IComment>, @Req() req: Request): Promise<WithPagination<CommentViewDto>> {
    const postExist: boolean = await this.postsQueryRepository.isPostExist(postId);
    if (!postExist) {
      throw new NotFoundException();
    }
    return await this.commentsQueryRepo.getComments(req.userId, { postId }, CommentsDataMapper.toRepoQuery(query), CommentsDataMapper.toCommentsView);
  }

  @Post('/:id/comments')
  @HttpCode(Status.CREATED)
  async createComment(@Param('id') postId: string, @Body() input: PostCommentCreateDto, @Req() req: Request): Promise<CommentViewDto> {
    const result: ServiceResult<CommentViewDto> = await this.commentsService.createComment(postId, req.userId, input, CommentsDataMapper.toCommentView);

    if (result.hasErrorCode(CommentServiceError.POST_NOT_FOUND) || result.hasErrorCode(CommentServiceError.USER_NOT_FOUND)) {
      throw new NotFoundException();
    }

    return result.getData();
  }
}
