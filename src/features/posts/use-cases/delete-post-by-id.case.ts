import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { PostServiceError } from '../types/errors';
import { Inject } from '@nestjs/common';
import { IPostsRepository, PostRepoKey } from '../types/common';

export class DeletePostByIdCommand {
  constructor(public readonly postId: string) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdCase implements ICommandHandler<DeletePostByIdCommand> {
  constructor(@Inject(PostRepoKey) private readonly postsRepo: IPostsRepository) {}

  async execute({ postId }: DeletePostByIdCommand): Promise<ServiceResult> {
    const result = new ServiceResult();
    const isPostExist: boolean = await this.postsRepo.isPostExist(postId);
    if (!isPostExist) {
      result.addError({
        code: PostServiceError.POST_NOT_FOUND,
      });
      return result;
    }

    const isDeleted: boolean = await this.postsRepo.deletePostById(postId);
    if (!isDeleted) {
      result.addError({
        code: PostServiceError.POST_NOT_DELETED,
      });
    }
    return result;
  }
}
