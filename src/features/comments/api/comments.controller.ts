import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Injectable,
  NotFoundException,
  Param,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepoKey, ICommentsController, ICommentsQueryRepository } from '../types/common';
import { CommentsService } from '../domain/comments.service';
import { CommentViewModel } from '../types/dto';
import { Request } from 'express';
import { Status } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { SetTokenGuardParams } from '../../../application/decorators/skipTokenError';
import { LikeStatusUpdateDto } from '../../likes/dto/LikeStatusUpdateDto';
import { CommentUpdateDto } from '../dto/CommentUpdateDto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentByIdCommand } from '../use-cases/update-comment-by-id.case';
import { CommentServiceError } from '../types/errors';
import { DeleteCommentByIdCommand } from '../use-cases/delete-comment-by-id.case';
import { UpdateCommentLikeStatusCommand } from '../use-cases/update-comment-like-status.case';

@Injectable()
@Controller('comments')
export class CommentsController implements ICommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsService: CommentsService,
    @Inject(CommentsQueryRepoKey) private readonly commentsQueryRepo: ICommentsQueryRepository,
  ) {}

  @Get('/:id')
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getComment(@Param('id') commentId: string, @Req() req: Request): Promise<CommentViewModel> {
    const comment: CommentViewModel | null = await this.commentsQueryRepo.getCommentById(req.userId, commentId);
    if (comment) {
      return comment;
    }
    throw new NotFoundException();
  }

  @Put('/:id')
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.NO_CONTENT)
  async updateComment(@Param('id') commentId: string, @Body() dto: CommentUpdateDto, @Req() req: Request): Promise<void> {
    const result: ServiceResult = await this.commandBus.execute<UpdateCommentByIdCommand, ServiceResult>(
      new UpdateCommentByIdCommand(commentId, req.userId, dto),
    );

    if (result.hasErrorCode(CommentServiceError.COMMENT_NOT_FOUND)) {
      throw new NotFoundException();
    }

    if (result.hasErrorCode(CommentServiceError.COMMENT_ACCESS_DENIED)) {
      throw new ForbiddenException();
    }
  }

  @Put('/:id/like-status')
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.NO_CONTENT)
  async updateCommentLikeStatus(@Param('id') commentId: string, @Body() input: LikeStatusUpdateDto, @Req() req: Request): Promise<void> {
    const result: ServiceResult = await this.commandBus.execute<UpdateCommentLikeStatusCommand, ServiceResult>(
      new UpdateCommentLikeStatusCommand(req.userId, {
        commentId: commentId,
        status: input.likeStatus,
      }),
    );

    if (result.hasErrorCode(CommentServiceError.USER_ID_REQUIRED) || result.hasErrorCode(CommentServiceError.USER_NOT_FOUND)) {
      throw new UnauthorizedException();
    }

    if (result.hasErrorCode(CommentServiceError.COMMENT_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Delete('/:id')
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.NO_CONTENT)
  async deleteComment(@Param('id') commentId: string, @Req() req: Request): Promise<void> {
    const result: ServiceResult = await this.commandBus.execute<DeleteCommentByIdCommand, ServiceResult>(new DeleteCommentByIdCommand(commentId, req.userId));

    if (result.hasErrorCode(CommentServiceError.COMMENT_NOT_FOUND)) {
      throw new NotFoundException();
    }

    if (result.hasErrorCode(CommentServiceError.COMMENT_ACCESS_DENIED)) {
      throw new ForbiddenException();
    }
  }
}
