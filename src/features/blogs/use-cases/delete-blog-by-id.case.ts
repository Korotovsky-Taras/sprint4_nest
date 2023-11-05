import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogDBType } from '../types/dao';
import { BlogServiceError } from '../types/errors';
import { Inject } from '@nestjs/common';
import { BlogRepoKey, IBlogsRepository } from '../types/common';

export class DeleteBlogByIdCommand {
  constructor(public readonly blogId: string) {}
}

@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdCase implements ICommandHandler<DeleteBlogByIdCommand, ServiceResult> {
  constructor(@Inject(BlogRepoKey) private readonly blogsRepo: IBlogsRepository) {}

  async execute({ blogId }: DeleteBlogByIdCommand): Promise<ServiceResult> {
    const blog: BlogDBType | null = await this.blogsRepo.getBlogById(blogId);
    const result = new ServiceResult();

    if (!blog) {
      result.addError({
        message: 'Blog not found',
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
      return result;
    }

    const idDeleted = await this.blogsRepo.deleteBlogById(blogId);
    if (!idDeleted) {
      result.addError({
        message: 'Blog is not deleted',
        code: BlogServiceError.BLOG_NOT_DELETED,
      });
    }
    return result;
  }
}
