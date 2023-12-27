import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommentServiceError } from '../types/errors';
import { CommentsRepoKey, ICommentsRepository } from '../types/common';
import { Inject } from '@nestjs/common';

export class DeleteCommentByIdCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: UserIdReq,
  ) {}
}

@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommentByIdCase implements ICommandHandler<DeleteCommentByIdCommand> {
  constructor(@Inject(CommentsRepoKey) private readonly commentsRepo: ICommentsRepository<any>) {}

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
