import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { Inject } from '@nestjs/common';
import { BlogServiceError } from '../types/errors';
import { IPostsRepository, PostRepoKey } from '../../posts/types/common';
import { BlogPostUpdateDto } from '../dto/BlogPostUpdateDto';

export class UpdateBlogPostByIdCommand {
  constructor(
    public readonly blogId: string,
    public readonly postId: string,
    public readonly dto: BlogPostUpdateDto,
  ) {}
}

@CommandHandler(UpdateBlogPostByIdCommand)
export class UpdateBlogPostByIdCase implements ICommandHandler<UpdateBlogPostByIdCommand> {
  constructor(@Inject(PostRepoKey) private readonly postsRepo: IPostsRepository<any>) {}

  async execute({ blogId, postId, dto }: UpdateBlogPostByIdCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, BlogPostUpdateDto);
    const result = new ServiceResult();

    const isPostExist: boolean = await this.postsRepo.isBlogPostByIdExist(blogId, postId);
    if (!isPostExist) {
      result.addError({
        code: BlogServiceError.POST_NOT_FOUND,
      });
      return result;
    }

    const isUpdated: boolean = await this.postsRepo.updateBlogPostById(blogId, postId, dto);
    if (!isUpdated) {
      result.addError({
        code: BlogServiceError.POST_NOT_UPDATED,
      });
    }
    return result;
  }
}
