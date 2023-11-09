import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommentServiceError } from '../types/errors';
import { CommentLikeStatusInputModel } from '../types/dto';
import { Inject } from '@nestjs/common';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { CommentsQueryRepoKey, CommentsRepoKey, ICommentsQueryRepository, ICommentsRepository } from '../types/common';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public readonly userId: UserIdReq,
    public readonly model: CommentLikeStatusInputModel,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusCase implements ICommandHandler<UpdateCommentLikeStatusCommand> {
  constructor(
    @Inject(CommentsQueryRepoKey) private readonly commentsQueryRepo: ICommentsQueryRepository,
    @Inject(CommentsRepoKey) private readonly commentsRepo: ICommentsRepository,
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository,
  ) {}

  async execute({ userId, model }: UpdateCommentLikeStatusCommand): Promise<ServiceResult> {
    const result = new ServiceResult();

    if (userId === null) {
      result.addError({
        code: CommentServiceError.USER_ID_REQUIRED,
      });
      return result;
    }

    const userModel = await this.usersRepo.getUserById(userId);

    if (userModel === null) {
      result.addError({
        code: CommentServiceError.USER_NOT_FOUND,
      });
      return result;
    }

    const comment = await this.commentsQueryRepo.getCommentById(userId, model.commentId);

    if (comment === null) {
      result.addError({
        code: CommentServiceError.COMMENT_NOT_FOUND,
      });
      return result;
    }

    await this.commentsRepo.updateLike(model.commentId, userModel._id, model.status);

    return result;
  }
}
