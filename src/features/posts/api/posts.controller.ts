import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IPostsController } from '../types/common';
import { PostLikeServiceError, PostsService } from '../domain/posts.service';
import { PostsDataMapper } from './posts.dm';
import { PostsQueryRepository } from '../dao/posts.query.repository';
import { IPost } from '../types/dao';
import { PostViewModel } from '../types/dto';
import { Request } from 'express';
import { CommentViewModel } from '../../comments/types/dto';
import { CommentServiceError, CommentsService } from '../../comments/domain/comments.service';
import { CommentsQueryRepository } from '../../comments/dao/comments.query.repository';
import { CommentsDataMapper } from '../../comments/api/comments.dm';
import { IComment } from '../../comments/types/dao';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { PaginationQueryModel, Status, WithPagination } from '../../../application/utils/types';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { SetTokenGuardParams } from '../../../application/decorators/skipTokenError';
import { PostCreateDto } from '../dto/PostCreateDto';
import { AuthBasicGuard } from '../../../application/guards/AuthBasicGuard';
import { PostUpdateDto } from '../dto/PostUpdateDto';
import { PostCommentCreateDto } from '../dto/PostCommentCreateDto';
import { LikeStatusUpdateDto } from '../../likes/dto/LikeStatusUpdateDto';
import { GetUserId } from '../../../application/decorators/params/getUserId';

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
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  async getAll(@Query() query: PaginationQueryModel<IPost>, @Req() req: Request): Promise<WithPagination<PostViewModel>> {
    return await this.postsQueryRepository.getPosts(req.userId, {}, PostsDataMapper.toRepoQuery(query), PostsDataMapper.toPostsView);
  }

  @Get(':id')
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getPost(@Param('id') postId: string, @Req() req: Request): Promise<PostViewModel> {
    const post: PostViewModel | null = await this.postsQueryRepository.getPostById(req.userId, postId, PostsDataMapper.toPostView);
    if (post) {
      return post;
    }
    throw new NotFoundException();
  }

  @Post()
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.CREATED)
  async createPost(@Body() input: PostCreateDto, @Req() req: Request): Promise<PostViewModel> {
    const post: PostViewModel | null = await this.postsService.createPost(req.userId, input);
    if (post) {
      return post;
    }
    throw new BadRequestException();
  }

  @Put(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.NO_CONTENT)
  async updatePost(@Param('id') postId: string, @Body() input: PostUpdateDto): Promise<void> {
    const postExist: boolean = await this.postsQueryRepository.isPostExist(postId);
    if (!postExist) {
      throw new NotFoundException();
    }
    await this.postsService.updatePostById(postId, input);
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.NO_CONTENT)
  async deletePost(@Param('id') postId: string): Promise<void> {
    const postExist: boolean = await this.postsQueryRepository.isPostExist(postId);
    if (!postExist) {
      throw new NotFoundException();
    }
    await this.postsService.deletePostById(postId);
  }

  @Get('/:id/comments')
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getComments(
    @Param('id') postId: string,
    @Query() query: PaginationQueryModel<IComment>,
    @Req() req: Request,
  ): Promise<WithPagination<CommentViewModel>> {
    const postExist: boolean = await this.postsQueryRepository.isPostExist(postId);
    if (!postExist) {
      throw new NotFoundException();
    }
    return await this.commentsQueryRepo.getComments(req.userId, { postId }, CommentsDataMapper.toRepoQuery(query), CommentsDataMapper.toCommentsView);
  }

  @Post('/:id/comments')
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.CREATED)
  async createComment(@Param('id') postId: string, @Body() input: PostCommentCreateDto, @Req() req: Request): Promise<CommentViewModel> {
    const result: ServiceResult<CommentViewModel> = await this.commentsService.createComment(postId, req.userId, input, CommentsDataMapper.toCommentView);

    if (result.hasErrorCode(CommentServiceError.POST_NOT_FOUND) || result.hasErrorCode(CommentServiceError.USER_NOT_FOUND)) {
      throw new NotFoundException();
    }

    return result.getData();
  }

  @Put('/:id/like-status')
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.NO_CONTENT)
  async updateCommentLikeStatus(@Param('id') postId: string, @Body() input: LikeStatusUpdateDto, @GetUserId() userId: string): Promise<void> {
    const result: ServiceResult = await this.postsService.updateLikeStatus({
      postId: postId,
      userId: userId,
      status: input.likeStatus,
    });
    if (result.hasErrorCode(PostLikeServiceError.POST_NO_FOUND)) {
      throw new NotFoundException();
    }
    if (result.hasErrorCode(PostLikeServiceError.UNAUTHORIZED)) {
      throw new NotFoundException();
    }
  }
}
