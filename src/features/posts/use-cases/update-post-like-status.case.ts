import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { PostsRepository } from '../dao/posts.repository';
import { PostServiceError } from '../types/errors';
import { PostLikeStatusInputModel } from '../types/dto';
import { UsersRepository } from '../../users/dao/users.repository';

export class UpdatePostLikeStatusCommand {
  constructor(public readonly model: PostLikeStatusInputModel) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusCase implements ICommandHandler<UpdatePostLikeStatusCommand> {
  constructor(
    private readonly postsRepo: PostsRepository,
    private readonly usersRepo: UsersRepository,
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

    const post = await this.postsRepo.getPostById(model.postId);

    if (!post) {
      result.addError({
        code: PostServiceError.POST_NOT_FOUND,
      });
      return result;
    }

    const isPostUpdated = await this.postsRepo.updateLike(post._id.toString(), model.status, user._id.toString(), user.login);

    if (!isPostUpdated) {
      result.addError({
        code: PostServiceError.POST_NOT_UPDATED,
      });
    }

    return result;
  }
}
