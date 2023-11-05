import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Injectable,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IPostsController, IPostsQueryRepository, PostQueryRepoKey } from '../types/common';
import { PostsService } from '../domain/posts.service';
import { PostViewModel } from '../types/dto';
import { Request } from 'express';
import { CommentViewModel } from '../../comments/types/dto';
import { CommentsService } from '../../comments/domain/comments.service';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { Status, WithPagination } from '../../../application/utils/types';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { SetTokenGuardParams } from '../../../application/decorators/skipTokenError';
import { PostCreateDto } from '../dto/PostCreateDto';
import { AuthBasicGuard } from '../../../application/guards/AuthBasicGuard';
import { PostUpdateDto } from '../dto/PostUpdateDto';
import { PostCommentCreateDto } from '../dto/PostCommentCreateDto';
import { LikeStatusUpdateDto } from '../../likes/dto/LikeStatusUpdateDto';
import { GetUserId } from '../../../application/decorators/params/getUserId';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommentByIdCommand } from '../use-cases/create-post-comment-by-id.case';
import { PostServiceError } from '../types/errors';
import { CreatePostCommand } from '../use-cases/create-post.case';
import { DeletePostByIdCommand } from '../use-cases/delete-post-by-id.case';
import { UpdatePostByIdCommand } from '../use-cases/udpate-post-by-id.case';
import { UpdatePostLikeStatusCommand } from '../use-cases/update-post-like-status.case';
import { PostPaginationQueryDto } from '../dto/PostPaginationQueryDto';
import { CommentsPaginationQueryDto } from '../../comments/dto/CommentsPaginationQueryDto';
import { CommentsQueryRepoKey, ICommentsQueryRepository } from '../../comments/types/common';

@Injectable()
@Controller('posts')
export class PostsController implements IPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    @Inject(CommentsQueryRepoKey) private readonly commentsQueryRepo: ICommentsQueryRepository,
    @Inject(PostQueryRepoKey) private postsQueryRepo: IPostsQueryRepository,
  ) {}

  @Get()
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  async getAll(@Query() query: PostPaginationQueryDto, @Req() req: Request): Promise<WithPagination<PostViewModel>> {
    return await this.postsQueryRepo.getAllPosts(req.userId, query);
  }

  @Get(':id')
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getPost(@Param('id') postId: string, @Req() req: Request): Promise<PostViewModel> {
    const post: PostViewModel | null = await this.postsQueryRepo.getPostById(req.userId, postId);
    if (post) {
      return post;
    }
    throw new NotFoundException();
  }

  @Post()
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.CREATED)
  async createPost(@Body() dto: PostCreateDto, @Req() req: Request): Promise<PostViewModel> {
    const result = await this.commandBus.execute<CreatePostCommand, ServiceResult<PostViewModel>>(new CreatePostCommand(req.userId, dto));
    if (result.hasErrorCode(PostServiceError.BLOG_NOT_FOUND)) {
      throw new BadRequestException();
    }
    return result.getData();
  }

  @Put(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.NO_CONTENT)
  async updatePost(@Param('id') postId: string, @Body() dto: PostUpdateDto): Promise<void> {
    const result = await this.commandBus.execute<UpdatePostByIdCommand, ServiceResult>(new UpdatePostByIdCommand(postId, dto));

    if (result.hasErrorCode(PostServiceError.POST_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.NO_CONTENT)
  async deletePost(@Param('id') postId: string): Promise<void> {
    const result = await this.commandBus.execute<DeletePostByIdCommand, ServiceResult>(new DeletePostByIdCommand(postId));

    if (result.hasErrorCode(PostServiceError.POST_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Get('/:id/comments')
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getComments(@Param('id') postId: string, @Query() query: CommentsPaginationQueryDto, @Req() req: Request): Promise<WithPagination<CommentViewModel>> {
    const postExist: boolean = await this.postsQueryRepo.isPostExist(postId);
    if (!postExist) {
      throw new NotFoundException();
    }
    return await this.commentsQueryRepo.getComments(req.userId, postId, query);
  }

  @Post('/:id/comments')
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.CREATED)
  async createComment(@Param('id') postId: string, @Body() dto: PostCommentCreateDto, @Req() req: Request): Promise<CommentViewModel> {
    const result: ServiceResult<CommentViewModel> = await this.commandBus.execute<CreatePostCommentByIdCommand, ServiceResult<CommentViewModel>>(
      new CreatePostCommentByIdCommand(postId, req.userId, dto),
    );

    if (result.hasErrorCode(PostServiceError.POST_NOT_FOUND) || result.hasErrorCode(PostServiceError.USER_NOT_FOUND)) {
      throw new NotFoundException();
    }

    return result.getData();
  }

  @Put('/:id/like-status')
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.NO_CONTENT)
  async updateCommentLikeStatus(@Param('id') postId: string, @Body() dto: LikeStatusUpdateDto, @GetUserId() userId: string): Promise<void> {
    const result = await this.commandBus.execute<UpdatePostLikeStatusCommand, ServiceResult>(
      new UpdatePostLikeStatusCommand({
        postId: postId,
        userId: userId,
        status: dto.likeStatus,
      }),
    );

    if (result.hasErrorCode(PostServiceError.POST_NOT_FOUND)) {
      throw new NotFoundException();
    }
    if (result.hasErrorCode(PostServiceError.USER_UNAUTHORIZED)) {
      throw new NotFoundException();
    }
  }
}
