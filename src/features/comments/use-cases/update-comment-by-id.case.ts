import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { CommentUpdateDto } from '../dto/CommentUpdateDto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommentServiceError } from '../types/errors';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { Inject } from '@nestjs/common';
import { CommentsRepoKey, ICommentsRepository } from '../types/common';

export class UpdateCommentByIdCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: UserIdReq,
    public readonly dto: CommentUpdateDto,
  ) {}
}

@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdCase implements ICommandHandler<UpdateCommentByIdCommand> {
  constructor(@Inject(CommentsRepoKey) private readonly commentsRepo: ICommentsRepository<any>) {}

  async execute({ commentId, userId, dto }: UpdateCommentByIdCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, CommentUpdateDto);

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

    const isUpdated: boolean = await this.commentsRepo.updateCommentById(commentId, dto);

    if (!isUpdated) {
      result.addError({
        code: CommentServiceError.COMMENT_NOT_UPDATED,
      });
    }

    return result;
  }
}
