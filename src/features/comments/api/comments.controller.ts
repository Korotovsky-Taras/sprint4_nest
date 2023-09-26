import { Body, Controller, Delete, Get, HttpCode, Injectable, NotFoundException, Param, Put, Req } from '@nestjs/common';
import { ICommentsController } from '../types/common';
import { CommentsService } from '../domain/comments.service';
import { CommentsQueryRepository } from '../dao/comments.query.repository';
import { CommentUpdateDto, CommentViewDto } from '../types/dto';
import { Request } from 'express';
import { CommentsDataMapper } from './comments.dm';
import { Status } from '../../../utils/types';
import { LikeStatusUpdateDto } from '../../likes/types';

@Injectable()
@Controller('comments')
export class CommentsController implements ICommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepo: CommentsQueryRepository,
  ) {}

  @Get(':id')
  @HttpCode(Status.OK)
  async getComment(@Param('id') commentId: string, @Req() req: Request): Promise<CommentViewDto> {
    const comment: CommentViewDto | null = await this.commentsQueryRepo.getCommentById(req.userId, commentId, CommentsDataMapper.toCommentView);
    if (comment) {
      return comment;
    }
    throw new NotFoundException();
  }

  @Put(':id')
  @HttpCode(Status.NO_CONTENT)
  async updateComment(@Param('id') commentId: string, @Body() input: CommentUpdateDto, @Req() req: Request): Promise<void> {
    await this.commentsService.updateCommentById(commentId, req.userId, input);
  }

  @Put(':id/like-status')
  @HttpCode(Status.NO_CONTENT)
  async updateCommentLikeStatus(@Param('id') commentId: string, @Body() input: LikeStatusUpdateDto, @Req() req: Request): Promise<void> {
    await this.commentsService.updateLikeStatus(req.userId, {
      commentId: commentId,
      status: input.likeStatus,
    });
  }

  @Delete(':id')
  async deleteComment(@Param('id') commentId: string, @Req() req: Request): Promise<void> {
    await this.commentsService.deleteCommentById(commentId, req.userId);
  }
}
