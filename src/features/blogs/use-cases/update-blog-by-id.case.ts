import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { BlogsRepository } from '../dao/blogs.repository';
import { BlogMongoType } from '../types/dao';
import { BlogUpdateDto } from '../dto/BlogUpdateDto';
import { BlogServiceError } from '../types/errors';

export class UpdateBlogByIdCommand {
  constructor(
    public readonly blogId: string,
    public readonly dto: BlogUpdateDto,
  ) {}
}

@CommandHandler(UpdateBlogByIdCommand)
export class UpdateBlogByIdCase implements ICommandHandler<UpdateBlogByIdCommand, ServiceResult> {
  constructor(private readonly blogsRepo: BlogsRepository) {}

  async execute({ dto, blogId }: UpdateBlogByIdCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, BlogUpdateDto);

    const blog: BlogMongoType | null = await this.blogsRepo.getBlogById(blogId);
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
