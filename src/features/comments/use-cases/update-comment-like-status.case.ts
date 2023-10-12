import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommentsRepository } from '../dao/comments.repository';
import { CommentServiceError } from '../types/errors';
import { CommentLikeStatusInputModel } from '../types/dto';
import { CommentMongoType } from '../types/dao';
import { UsersRepository } from '../../users/dao/users.repository';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public readonly userId: UserIdReq,
    public readonly model: CommentLikeStatusInputModel,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusCase implements ICommandHandler<UpdateCommentLikeStatusCommand> {
  constructor(
    private readonly commentsRepo: CommentsRepository,
    private readonly usersRepo: UsersRepository,
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

    const comment: CommentMongoType | null = await this.commentsRepo.getCommentById(model.commentId);

    if (comment === null) {
      result.addError({
        code: CommentServiceError.COMMENT_NOT_FOUND,
      });
      return result;
    }

    const isUpdated = await this.commentsRepo.updateLike(comment._id.toString(), userModel.id, userModel.login, model.status);

    if (!isUpdated) {
      result.addError({
        code: CommentServiceError.COMMENT_NOT_UPDATED,
      });
      return result;
    }

    return result;
  }
}
