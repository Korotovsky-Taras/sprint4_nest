import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { PostsRepository } from '../dao/posts.repository';
import { PostServiceError } from '../types/errors';

export class DeletePostByIdCommand {
  constructor(public readonly postId: string) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdCase implements ICommandHandler<DeletePostByIdCommand> {
  constructor(private readonly postsRepo: PostsRepository) {}

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
