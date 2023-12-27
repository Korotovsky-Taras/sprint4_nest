import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { Inject } from '@nestjs/common';
import { IPostsRepository, PostRepoKey } from '../../posts/types/common';
import { BlogServiceError } from '../types/errors';

export class DeleteBlogPostByIdCommand {
  constructor(
    public readonly blogId: string,
    public readonly postId: string,
  ) {}
}

@CommandHandler(DeleteBlogPostByIdCommand)
export class DeleteBlogPostByIdCase implements ICommandHandler<DeleteBlogPostByIdCommand> {
  constructor(@Inject(PostRepoKey) private readonly postsRepo: IPostsRepository<any>) {}

  async execute({ blogId, postId }: DeleteBlogPostByIdCommand): Promise<ServiceResult> {
    const result = new ServiceResult();
    const isPostExist: boolean = await this.postsRepo.isBlogPostByIdExist(blogId, postId);
    if (!isPostExist) {
      result.addError({
        code: BlogServiceError.POST_NOT_FOUND,
      });
      return result;
    }

    const isDeleted: boolean = await this.postsRepo.deleteBlogPostById(blogId, postId);
    if (!isDeleted) {
      result.addError({
        code: BlogServiceError.POST_NOT_DELETED,
      });
    }
    return result;
  }
}
