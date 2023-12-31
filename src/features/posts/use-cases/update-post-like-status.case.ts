import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { PostServiceError } from '../types/errors';
import { PostLikeStatusInputModel } from '../types/dto';
import { Inject } from '@nestjs/common';
import { IPostsRepository, PostRepoKey } from '../types/common';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';

export class UpdatePostLikeStatusCommand {
  constructor(public readonly model: PostLikeStatusInputModel) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusCase implements ICommandHandler<UpdatePostLikeStatusCommand> {
  constructor(
    @Inject(PostRepoKey) private readonly postsRepo: IPostsRepository<any>,
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository<any>,
  ) {}

  async execute({ model }: UpdatePostLikeStatusCommand): Promise<ServiceResult> {
    const result = new ServiceResult();

    const user = await this.usersRepo.getUserById(model.userId);

    if (user == null) {
      result.addError({
        code: PostServiceError.USER_UNAUTHORIZED,
      });
      return result;
    }

    const postExist = await this.postsRepo.isPostByIdExist(model.postId);

    if (!postExist) {
      result.addError({
        code: PostServiceError.POST_NOT_FOUND,
      });
      return result;
    }

    const isPostUpdated = await this.postsRepo.updateLike(model.postId, model.status, user._id, user.login);

    if (!isPostUpdated) {
      result.addError({
        code: PostServiceError.POST_NOT_UPDATED,
      });
    }

    return result;
  }
}
