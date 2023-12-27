import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { BlogUpdateDto } from '../dto/BlogUpdateDto';
import { BlogServiceError } from '../types/errors';
import { Inject } from '@nestjs/common';
import { BlogRepoKey, IBlogsRepository } from '../types/common';
import { BlogViewModel } from '../types/dto';

export class UpdateBlogByIdCommand {
  constructor(
    public readonly blogId: string,
    public readonly dto: BlogUpdateDto,
  ) {}
}

@CommandHandler(UpdateBlogByIdCommand)
export class UpdateBlogByIdCase implements ICommandHandler<UpdateBlogByIdCommand, ServiceResult> {
  constructor(@Inject(BlogRepoKey) private readonly blogsRepo: IBlogsRepository<any>) {}

  async execute({ dto, blogId }: UpdateBlogByIdCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, BlogUpdateDto);

    const blog: BlogViewModel | null = await this.blogsRepo.getBlogById(blogId);
    const result = new ServiceResult();

    if (!blog) {
      result.addError({
        message: 'Blog not found',
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
      return result;
    }

    const isUpdated = await this.blogsRepo.updateBlogById(blogId, dto);
    if (!isUpdated) {
      result.addError({
        message: 'Blog is not updated',
        code: BlogServiceError.BLOG_NOT_UPDATED,
      });
    }

    return result;
  }
}
