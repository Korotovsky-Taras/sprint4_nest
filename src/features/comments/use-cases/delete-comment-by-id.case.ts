import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommentsRepository } from '../dao/comments.repository';
import { CommentServiceError } from '../types/errors';

export class DeleteCommentByIdCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: UserIdReq,
  ) {}
}

@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommentByIdCase implements ICommandHandler<DeleteCommentByIdCommand> {
  constructor(private readonly commentsRepo: CommentsRepository) {}

  async execute({ commentId, userId }: DeleteCommentByIdCommand): Promise<ServiceResult> {
    const result = new ServiceResult();

    const comment: boolean = await this.commentsRepo.isCommentExist(commentId);

    if (!comment || !userId) {
      result.addError({
        code: CommentServiceError.COMMENT_NOT_FOUND,
      });
      return result;
    }

    const isUserCommentOwner: boolean = await this.commentsRepo.isUserCommentOwner(commentId, userId);

    if (!isUserCommentOwner) {
      result.addError({
        code: CommentServiceError.COMMENT_ACCESS_DENIED,
      });
      return result;
    }

    const isDeleted: boolean = await this.commentsRepo.deleteCommentById(commentId);

    if (!isDeleted) {
      result.addError({
        code: CommentServiceError.COMMENT_NOT_DELETED,
      });
    }
    return result;
  }
}
