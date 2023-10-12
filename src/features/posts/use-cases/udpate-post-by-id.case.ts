import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { PostsRepository } from '../dao/posts.repository';
import { PostServiceError } from '../types/errors';
import { PostUpdateDto } from '../dto/PostUpdateDto';

export class UpdatePostByIdCommand {
  constructor(
    public readonly postId: string,
    public readonly dto: PostUpdateDto,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostByIdCase implements ICommandHandler<UpdatePostByIdCommand> {
  constructor(private readonly postsRepo: PostsRepository) {}

  async execute({ postId, dto }: UpdatePostByIdCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, PostUpdateDto);
    const result = new ServiceResult();

    const isPostExist: boolean = await this.postsRepo.isPostExist(postId);
    if (!isPostExist) {
      result.addError({
        code: PostServiceError.POST_NOT_FOUND,
      });
      return result;
    }

    const isUpdated: boolean = await this.postsRepo.updatePostById(postId, dto);
    if (!isUpdated) {
      result.addError({
        code: PostServiceError.POST_NOT_UPDATED,
      });
    }
    return result;
  }
}
