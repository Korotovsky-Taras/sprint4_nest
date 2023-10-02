import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Injectable,
  NotFoundException,
  Param,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ICommentsController } from '../types/common';
import { CommentServiceError, CommentsService } from '../domain/comments.service';
import { CommentsQueryRepository } from '../dao/comments.query.repository';
import { CommentViewModel } from '../types/dto';
import { Request } from 'express';
import { CommentsDataMapper } from './comments.dm';
import { Status } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { SetTokenGuardParams } from '../../../application/decorators/skipTokenError';
import { LikeStatusUpdateDto } from '../../likes/dto/LikeStatusUpdateDto';
import { CommentUpdateDto } from '../dto/CommentUpdateDto';

@Injectable()
@Controller('comments')
export class CommentsController implements ICommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepo: CommentsQueryRepository,
  ) {}

  @Get('/:id')
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getComment(@Param('id') commentId: string, @Req() req: Request): Promise<CommentViewModel> {
    const comment: CommentViewModel | null = await this.commentsQueryRepo.getCommentById(req.userId, commentId, CommentsDataMapper.toCommentView);
    if (comment) {
      return comment;
    }
    throw new NotFoundException();
  }

  @Put('/:id')
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.NO_CONTENT)
  async updateComment(@Param('id') commentId: string, @Body() input: CommentUpdateDto, @Req() req: Request): Promise<void> {
    const result: ServiceResult = await this.commentsService.updateCommentById(commentId, req.userId, input);

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
    const result: ServiceResult = await this.commentsService.updateLikeStatus(req.userId, {
      commentId: commentId,
      status: input.likeStatus,
    });

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
    const result: ServiceResult = await this.commentsService.deleteCommentById(commentId, req.userId);

    if (result.hasErrorCode(CommentServiceError.COMMENT_NOT_FOUND)) {
      throw new NotFoundException();
    }

    if (result.hasErrorCode(CommentServiceError.COMMENT_ACCESS_DENIED)) {
      throw new ForbiddenException();
    }
  }
}
